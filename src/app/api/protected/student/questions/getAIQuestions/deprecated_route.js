// 'use server'

// import { createSupabaseAuth } from "../../../../supabase/supabaseAuth";
// import { createSupabaseService } from "../../../../supabase/supabaseService";
// import parseSupaSession from "../../../../supabase/parseSupabaseSession";
// import { NextResponse } from "next/server";
// import { authMiddlewareSession } from "../../../../lib/middleware/authMiddlewareSession";
// import createError from "../../../../utils/createError";
// import populateURLParams from "../../../../utils/populateURLParams";
// import { QuestionProcessing } from "./question_processing";
// import { QuestionDatabase } from "./question_database";
// import DEBUG_getAIQuestions from "./debug";

// const tf = require('@tensorflow/tfjs');
// tf.env().set('PROD', process.env.NEXT_PUBLIC_IS_PROD == 'true' ? true : false);

// const ml_model_version = 2;

// export async function GET(req) {

//     let model;
//     let pred;
//     let currentScoreTensor;

//     const params = {
//         region: true,
//         debug: false,
//         debug_api_key: false,
//         debug_question_id: false,
//         debug_user_id: false
//     }

//     try {
//         populateURLParams(req, params);

//         const supabaseService = createSupabaseService();

//         const _QuestionDatabase = new QuestionDatabase(supabaseService);

//         const region = params.region;

//         const supabase = createSupabaseAuth();

//         const _data = await authMiddlewareSession(req, supabase);
//         const { user_id } = parseSupaSession(_data);

//         //FRONTEND DEBUG
//         if(params.debug) return await DEBUG_getAIQuestions(params, QuestionProcessing, _QuestionDatabase, NextResponse, user_id)
//         //FRONTEND DEBUG

//         //ASSERT ROLE WITH _DATA
//         //score_obj = {enabled_categories, current_scores}
//         const score_obj = await _QuestionDatabase.getStudentScoreCategoryObj(supabaseService, user_id);
//         const enabledScores = getEnabledScore(score_obj);
//         currentScoreTensor = getEnabledScoreTensor(enabledScores);
//         const httpIO = getTFHttpIO(`https://qvervegypimlrnjdsnrk.supabase.co/storage/v1/object/authenticated/tf-models/P2_Maths/v${ml_model_version}/model.json`);
//         model = await tf.loadLayersModel(httpIO);
//         pred = model.predict(currentScoreTensor);
//         const true_pred = await getTruePredictions(pred);

//         const filtered_true_pred = QuestionProcessing.filterPrediction(true_pred, enabledScores);

//         const questions = await _QuestionDatabase.getQuestions(filtered_true_pred, region, user_id);

//         QuestionProcessing.filterDuplicateNULLQuestions_byref(questions);

//         const ids = QuestionProcessing.getQuestionIDs(questions);

//         QuestionProcessing.clearAnswersExplanations_byref(questions);

//         await _QuestionDatabase.setAttempingQuestions(ids, user_id);

//         QuestionProcessing.sortQuestionsAscending_byref(questions);

//         await cleanup(pred, currentScoreTensor, model);
//         return NextResponse.json({ status: 200, message: `Success getAIQuestions`, data: questions}, { status: 200 })
//     }
//     catch(err) {
//         await cleanup(pred, currentScoreTensor, model);
//         return NextResponse.json({ status: err.status ?? 500, message: `Failed getAIQuestions: ${err.message}`, data: null}, { status: err.status ?? 500})
//     }
// }

// function getEnabledScore(data) {
//     const currentScore = data?.current_scores;
//     const enabled = data?.enabled_categories;

//     if(currentScore == null || enabled == null) {
//         throw createError("Internal Error: Scores unavailable", 500);
//     }
//     const enabledScores = currentScore.map((num, index) => num * enabled[index]);
//     return enabledScores;
// }

// function getEnabledScoreTensor(enabledScores) {
//     const currentScoreTensor = tf.tensor2d([enabledScores]);
//     return currentScoreTensor;
// }

// async function getTruePredictions(predTensorArray) {
//     // Convert each tensor in the predTensorArray to a JavaScript array
//     const arrays = await Promise.all(predTensorArray.map(tensor => tensor.array()));
//     // Perform argMax and increment operations on the arrays
//     const truePred = arrays.map(array => {
//         const flattenedArray = array.flat();
//         const argMaxIndex = flattenedArray.indexOf(Math.max(...flattenedArray));
//         return argMaxIndex + 1;
//     });

//     return {"categories":truePred.slice(0, 5), "difficulties":truePred.slice(5) };
// }

// async function cleanup(pred, currentScoreTensor, model) {
//     if (pred) {
//         pred.forEach(tensor => tensor.dispose());
//     }
//     if (currentScoreTensor) {
//         currentScoreTensor.dispose();
//     }
//     if (model) {
//         model.dispose();
//     }
// }

// function getTFHttpIO(url) {
//     const httpIO = tf.io.http(
//         url,
//         {
//             requestInit: {
//                 method: 'GET',
//                 headers: {
//                     authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
//                 }
//             }
//         })

//     return httpIO;
// }
