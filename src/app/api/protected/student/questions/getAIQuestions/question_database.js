// import createError from "../../../../utils/createError";

// export class QuestionDatabase {
//     constructor(supabase) {
//         this.supabase = supabase
//     }

//     async getStudentScoreCategoryObj(supabase, user_id) {
//         const { data, error } = await supabase
//         .rpc('get_student_score_categories', {
//             user_id_param: user_id
//         });

//         if (error) throw error;
//         return data;
//     }

//     async setAttempingQuestions(questionIDs, user_id) {

//         const { error } = await this.supabase
//             .from('students')
//             .update({ attempting_questions: questionIDs })
//             .eq('user_id', user_id)

//         if (error) throw error;
//     }

//     async getQuestions(truePred, region, user_id) {
//         const { data, error } = await this.supabase
//             .rpc('get_questionobj_bypredictionregion',
//                 {
//                     categories: truePred?.categories,
//                     difficulties: truePred?.difficulties,
//                     region: region,
//                     _user_id: user_id
//                 })

//         if(error) throw error;

//         if(!data.length) {
//             throw createError("Failed to create Questions", 500);
//         }

//         return data;
//     }

//     async getQuestionByID(id, region) {
//         const {data, error} = await this.supabase
//         .from('primary_questions')
//         .select(`id, ${this.getQuestionColumn(region)}`)
//         .eq('id', id)

//         if(error) throw error;
//         if(!data.length) throw createError("getAIQuestions Test case failed: Question not found", 401)

//         return data;
//     }

//     getQuestionColumn(region) {
//         return region == 'en' ? 'question_object_en' : 'question_object_zh'
//     }
// }
