import { getQuestionObjectEn } from "./apply-fixes-utils/db";
import { simplifyStructure } from "./apply-fixes-utils/utils";
import { log } from "./apply-fixes-utils/logger";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Please provide a question ID");
    process.exit(1);
  }

  const questionId = parseInt(args[0]);
  if (isNaN(questionId)) {
    console.error("Invalid question ID");
    process.exit(1);
  }

  console.log(`Inspecting Question ${questionId}...`);
  try {
    const obj = await getQuestionObjectEn(questionId);
    console.log("\nFull Object:");
    console.log(JSON.stringify(obj, null, 2));

    console.log("\nSimplified Structure:");
    console.log(JSON.stringify(simplifyStructure(obj.content || []), null, 2));
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

main();
