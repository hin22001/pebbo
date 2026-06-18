// import createError from "../../../../utils/createError";

// export default async function DEBUG_getAIQuestions(params, QuestionProcessing, _QuestionDatabase, NextResponse, user_id) {
//     if(!params.debug) throw createError("Unexpected error", 500);
//     if(params.debug_api_key != process.env.ADMIN_KEY) throw createError("Unauthorized", 401);

//     const questions = await _QuestionDatabase.getQuestionByID(params.debug_question_id, params.region);

//     adjustKeys(questions);

//     QuestionProcessing.filterDuplicateNULLQuestions_byref(questions);

//     const ids = QuestionProcessing.getQuestionIDs(questions);

//     QuestionProcessing.clearAnswersExplanations_byref(questions);

//     await _QuestionDatabase.setAttempingQuestions(ids, params?.debug_user_id ? params.debug_user_id : user_id);

//     QuestionProcessing.sortQuestionsAscending_byref(questions);

//     return NextResponse.json({ status: 200, message: `DEBUG: Success getAIQuestions`, data: questions}, { status: 200 })
// }

// function adjustKeys(questions) {
//     const question_object = questions[0]?.question_object_en ? questions[0].question_object_en : questions[0].question_object_zh

//     questions[0].question_object = question_object;
//     delete questions[0].question_object_en;
//     delete questions[0].question_object_zh;
// }
