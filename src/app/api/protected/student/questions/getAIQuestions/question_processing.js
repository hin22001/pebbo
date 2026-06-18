// export class QuestionProcessing {

//     static filterDuplicateNULLQuestions_byref(questions) {
//         // const seenIds = [];
//         // for (let i = 0; i < questions.length; i++) {
//         //     if (seenIds.includes(questions[i].id)) {
//         //         questions.splice(i, 1);
//         //         i--; // adjust the index after removing an element
//         //     } else {
//         //         seenIds.push(questions[i].id);
//         //     }
//         // }
//         const seenIds = new Set();
//         let i = 0;
//         while(i < questions.length) {
//             const question = questions[i];
//             if(question?.question_object == null || seenIds.has(question.id)) {
//                 questions.splice(i, 1);
//             }
//             else {
//                 seenIds.add(question.id);
//                 i++;
//             }
//         }
//     }

//     static sortQuestionsAscending_byref(questions) {
//         questions.sort((a,b) => a.id-b.id);
//     }

//     static clearAnswersExplanations_byref(questions) {
//         questions.forEach(question => {
//             this.stackClearAnswersExplanations_byref(question?.question_object);
//         });
//     }

//     static stackClearAnswersExplanations_byref(tiptap) {
//         const stack = [tiptap];

//         while(stack.length > 0) {
//             const current = stack.pop();

//             if(current?.content) {
//                 current.content.forEach(child => stack.push(child));
//             }
//             else {
//                 if(current?.attrs?.answer) { current.attrs.answer = "" } //for TextFieldReactComponent "answer"
//                 if(current?.attrs?.answers) {
//                     const answers_array = JSON.parse(current.attrs.answers);

//                     current.attrs.multiple = answers_array.length > 1 ? true : false
//                     current.attrs.answers = ""
//                 } //for DropdownReactComponent "answers"
//                 if(current?.attrs?.explanation) { current.attrs.explanation = "" }
//             }
//         }
//     }

//     static getQuestionIDs(questions) {
//         const arrayOfIds = questions.map(object => object.id);
//         return arrayOfIds;
//     }

//     static filterPrediction(truePred, enabledScores) {

//         const categories = truePred?.categories;
//         const difficulties = truePred?.difficulties;

//         const nonZeroIndices = enabledScores.reduce((acc, score, index) => {
//             if (score !== 0) acc.push(index);
//             return acc;
//         }, []);

//         const zeroBasedCategories = categories.map(c => c - 1);

//         for(let i=0; i<zeroBasedCategories.length; i++) {
//             if(!(enabledScores[zeroBasedCategories[i]] > 0)) {
//                 const chasoCategoryZeroBased = nonZeroIndices[Math.floor(Math.random() * nonZeroIndices.length)];
//                 categories[i] = chasoCategoryZeroBased+1;
//             }
//         }

//         return {
//             'categories': categories,
//             'difficulties': difficulties
//         }
//     }
// }
