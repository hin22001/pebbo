// import createError from "../../../../utils/createError";
// import { pool_executeQuery } from "@/src/app/api/lib/postgres/pool_client";

// export class CompleteQuestionDatabase {
//     constructor(supabase) {
//         this.supabase = supabase
//     }

//     //COMBINE THESE TO ONE QUERY BEGIN
//     async getAttemptingQuestionsArray(user_id) {
//         const { data, error } = await this.supabase
//             .from('students')
//             .select('attempting_questions')
//             .limit(1)
//             .eq('user_id', user_id);

//         if(error) throw error;
//         if(!data?.length) throw createError("User does not exist", 401);
//         return data;
//     }

//     async getAttemptingQuestions(region, attempting_questions) {
//         const questionField = region == "en" ? "question_object_en" : "question_object_zh";

//         const { data, error } = await this.supabase
//         .from('primary_questions')
//         .select(`id, outer_category, difficulty, ${questionField} `)
//         .in('id', attempting_questions)
//         .order('id', { ascending: true });

//         if(error) throw error;
//         if(!data?.length) throw createError("Error fetching questions", 401);

//         const reshapedData = data.map(item => {
//             return {
//                 id: item.id,
//                 outer_category: item.outer_category,
//                 difficulty: item.difficulty,
//                 question_object: item[questionField]
//             };
//         });

//         return reshapedData;
//     }
//     //COMBINE THESE TO ONE QUERY END

//     async getStudentCurrentScore_function(user_id) {
//         const { data, error } = await this.supabase
//                 .rpc('get_student_current_score', {
//                     user_id_param: user_id
//                 });
//         if (error) throw error;
//         return data;
//     }

//     async getStudentCurrentScore_versioned(client, user_id) {
//         const query = {
//             text: `
//             SELECT sd.current_scores
//             FROM student_data sd
//             INNER JOIN students s ON sd.user_id = s.user_id
//                                  AND sd.education_level = s.education_level
//                                  AND sd.year = s.year
//             WHERE s.user_id = $1
//             LIMIT 1;
//             `,
//             values: [user_id]
//         }
//         const {data, error} = await pool_executeQuery(client, query)

//         if(error) throw createError("Query Failure", 500);

//         return data[0]?.current_scores
//     }

//     async update_user_score_function(completed_questions, new_score, user_id) {
//       const { error } = await this.supabase
//       .rpc('process_complete_questions', {
//           completed_qs: completed_questions,
//           new_score: new_score,
//           _user_id: user_id
//       });
//       if (error) throw error;
//     }

//     async update_user_score_versioned(sql, completed_questions, new_score, user_id) {

//         const result = await sql.begin(sql => [
//             sql`
//                 WITH sd as (
//                     UPDATE students
//                         SET stars = stars + ${completed_questions.length},
//                             attempting_questions = NULL
//                     WHERE user_id = ${user_id}
//                     RETURNING education_level, year
//                 )
//                 UPDATE student_data
//                     SET current_scores = ${new_score}
//                 WHERE user_id = ${user_id} AND
//                     education_level = (SELECT education_level from sd) AND
//                     year = (SELECT year from sd)
//             `,

//             sql`
//                 INSERT INTO completed_questions ${sql(completed_questions, 'user_id', 'question_id', 'accuracy', 'time_taken')}
//             `
//             ])
//         // const query = {
//         //     text: `
//         //     `,
//         //     values: [user_id]
//         // }
//         // const {data, error} = await pool_executeQuery(client, query)

//         // if(error) throw createError("Query Failure", 500);

//         // return data[0]?.current_scores

//         //get length of completed questions OK
//         //for each complted question add to completed_questions table with user_id
//         //add stars to students table 1 OK
//         //replace current_scores student_data table (with students tbale params) 1
//         //set attempting_questions to NULL students table 1 OK
//     }
// }
