"use server";

import Ajv from "ajv";

import { getReqBody } from "../../../../utils/getReqBody";
import { createSupabaseAuth } from "../../../../supabase/supabaseAuth";
import { createSupabaseService } from "../../../../supabase/supabaseService";
import { authMiddlewareSession } from "../../../../lib/middleware/authMiddlewareSession";
import { NextResponse } from "next/server";
import parseSupaSession from "../../../../supabase/parseSupabaseSession";
import getURLRegion from "../../../../utils/getURLRegion";
import createError from "../../../../utils/createError";
import { ajvValidateData } from "../../../../utils/tryAjv";
import userAnswers from "../../../../lib/ajv_schema/userAnswers";
import attemptingQuestions from "../../../../lib/ajv_schema/attemptingQuestions";

import { ScoreUpdater_v1 } from "@/src/app/engine/score_updater/score_updater_v1";
import p2_m_c_v1 from "@/src/app/engine/data/C_Matrix/P2_M_C_V1";

import { CompleteQuestionDatabase } from "./complete_question_database";

import { pool } from "@/src/app/api/lib/postgres/pool_client";
import { assertRole } from "@/src/app/api/supabase/assertRole";

const ajv = new Ajv();

export async function POST(req) {
  const client = await pool.connect();
  try {
    const region = getURLRegion(req);
    const { body } = await getReqBody(req);
    ajvValidateData(ajv, userAnswers, body, "User Answers invalid");

    const supabase = createSupabaseAuth();
    const _data = await authMiddlewareSession(req, supabase);
    assertRole(_data, "student");

    const { user_id } = parseSupaSession(_data);

    const supabaseService = createSupabaseService();

    const _CompleteQuestionDatabase = new CompleteQuestionDatabase(
      supabaseService,
    );

    const attempting_questions =
      await _CompleteQuestionDatabase.getAttemptingQuestionsArray(user_id);

    ajvValidateData(
      ajv,
      attemptingQuestions,
      attempting_questions[0],
      "User is not attempting questions",
    );
    const attempting_questions_array =
      attempting_questions[0]?.attempting_questions;
    validateQuestionIds(attempting_questions_array, body?.all_answers);

    const questions = await _CompleteQuestionDatabase.getAttemptingQuestions(
      region,
      attempting_questions_array,
    );

    const completed_questions = traverseAnswers(
      questions,
      body.all_answers,
      user_id,
    );

    // const current_score = await _CompleteQuestionDatabase.getUserScore(client, user_id);
    const current_score_2d =
      await _CompleteQuestionDatabase.getStudentCurrentScore_function(user_id);
    const current_score_1d = current_score_2d[0];

    const updater = new ScoreUpdater_v1(p2_m_c_v1);
    updater._updateScore(completed_questions, current_score_1d); //updated by ref

    // await _CompleteQuestionDatabase.update_user_score_versioned(sql, completed_questions, current_score, user_id);
    await _CompleteQuestionDatabase.update_user_score_function(
      completed_questions,
      current_score_1d,
      user_id,
    );

    return NextResponse.json(
      { status: 200, message: `Success completeQuestions`, data: questions },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: err.status ?? 500,
        message: `Failed completeQuestions: ${err.message}`,
        data: null,
      },
      { status: err.status ?? 500 },
    );
  } finally {
    client.release();
  }
}

function validateQuestionIds(attempting_questions, allAnswers) {
  const answerQuestionIds = allAnswers.map((answer) => answer.question_id);

  const valid =
    answerQuestionIds.every((id) => attempting_questions.includes(id)) &&
    attempting_questions.every((id) => answerQuestionIds.includes(id));

  if (!valid) throw createError("Wrong questions completed.", 400);
}

function traverseAnswers(questions, all_answers, user_id) {
  const completed_questions = [];

  for (let i = 0; i < questions.length; i++) {
    const completed_question = {
      //this is for the db
      user_id: user_id,
      question_id: questions[i].id,
      outer_category: questions[i].outer_category,
      difficulty: questions[i].difficulty,
      accuracy: null,
      time_taken: all_answers[i].time_taken,
    };

    const tiptap = questions[i].question_object;
    const queue = [tiptap];

    let user_answers_counter = 0;
    let total_accuracy = 0;

    while (queue.length > 0) {
      const current = queue.shift();

      if (current?.content) {
        current.content.forEach((child) => queue.push(child));
      } else {
        const answers =
          all_answers[i]?.user_answers[user_answers_counter]?.answers;
        if (current?.attrs?.answer) {
          if (answers) {
            const accuracy = checkAnswers(current.attrs, answers, "answer");
            total_accuracy += accuracy;
          }
          user_answers_counter++;
        } else if (current?.attrs?.answers) {
          if (answers) {
            const accuracy = checkAnswers(current.attrs, answers, "answers");
            total_accuracy += accuracy;
          }
          user_answers_counter++;
        }
      }
    }

    const accuracy = isNaN(total_accuracy / user_answers_counter)
      ? 0
      : total_accuracy / user_answers_counter;
    completed_question.accuracy = parseFloat(accuracy.toFixed(2));
    questions[i].accuracy = accuracy;
    completed_questions.push(completed_question);
  }

  return completed_questions;
}

function checkAnswers(attrs, answers, key) {
  // const standardize = answer => answer.replace(/\s/g, '').toUpperCase();
  const model_answers = JSON.parse(attrs[key]);

  if (Array.isArray(model_answers)) {
    //if(model_answers.length != answers?.length) throw createError("Answer length mismatch", 400);
    if (model_answers.length != answers?.length) {
      const accuracy = 0;
      attrs.accuracy = accuracy;
      attrs.isCorrect = false;
      attrs.multiple = model_answers.length > 1 ? true : false;
      return accuracy;
    }
    let correct = 0;

    for (let j = 0; j < model_answers.length; j++) {
      if (standardize(model_answers[j]?.label) == standardize(answers[j])) {
        correct++;
      }
    }

    const accuracy = correct / model_answers.length == 1.0 ? 1.0 : 0.0;

    attrs.accuracy = accuracy;
    // attrs.display_accuracy = `${correct}/${model_answers.length}`
    attrs.multiple = model_answers.length > 1 ? true : false;
    attrs.isCorrect = accuracy == 1.0 ? true : false;

    return accuracy;
  } else {
    if (answers?.length > 1)
      throw createError("Too many answers for text answer", 400);
    const user_answer = answers[0];
    const accuracy =
      standardize(model_answers) == standardize(user_answer) ? 1.0 : 0.0;

    attrs.accuracy = accuracy;
    // attrs.display_accuracy = accuracy == 1.0 ? "0/1" : "1/1"
    attrs.isCorrect = accuracy == 1.0 ? true : false;
    return accuracy;
  }
}
