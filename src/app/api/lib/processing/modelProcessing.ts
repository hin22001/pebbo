import { Onnx } from "@/src/app/api/lib/modelInference/onnx";
import { ArrayHelper } from "@/src/app/api/lib/utils/arrayHelper";

export class ModelProcessing {
  education_level: string;
  year: string;
  onnx: Onnx;

  constructor(education_level: string, year: string) {
    this.education_level = education_level;
    this.year = year;
  }

  async init() {
    this.onnx = new Onnx();
    await this.onnx.loadModel(this.education_level, this.year);
    await this.onnx.startInference();
  }

  async predict(current_score: number[]) {
    // Create the input tensor with the correct shape
    const inputTensor = this.onnx.creatInputTensor(
      [current_score],
      [1, current_score.length],
    );

    const result = await this.onnx.runInference(inputTensor);

    const categoryOutput = result[this.onnx.getOutputNames()[0]];
    const difficultyOutput = result[this.onnx.getOutputNames()[1]];

    const [__, numCatPred, categoryLength] = categoryOutput.dims;
    const [_, numDiffPred, difficultyLength] = difficultyOutput.dims;

    const _category_outputs: number[] = Array.prototype.slice.call(
      categoryOutput.data,
    );
    const _difficulty_outputs: number[] = Array.prototype.slice.call(
      difficultyOutput.data,
    );

    const category_outputs: number[][] = ArrayHelper.reshapeTo2D(
      _category_outputs,
      categoryLength,
    );

    const difficulty_outputs: number[][] = ArrayHelper.reshapeTo2D(
      _difficulty_outputs,
      difficultyLength,
    );

    const sigmoid_category_outputs = category_outputs.map((output) =>
      ArrayHelper.applySigmoid(output),
    );
    
    // Add small random noise to predictions to introduce variation
    const noisyCategories = sigmoid_category_outputs.map((output) =>
      output.map((val) => val + (Math.random() - 0.5) * 0.1) // Small noise ±0.05
    );
    const predictedCategories = noisyCategories.map((output) =>
      ArrayHelper.argmax(output),
    );

    const sigmoid_difficulty_outputs = difficulty_outputs.map((output) =>
      ArrayHelper.applySigmoid(output),
    );
    
    // Add small random noise to difficulty predictions as well
    const noisyDifficulties = sigmoid_difficulty_outputs.map((output) =>
      output.map((val) => val + (Math.random() - 0.5) * 0.1) // Small noise ±0.05
    );
    const predictedDifficulties = noisyDifficulties.map((output) =>
      ArrayHelper.argmax(output),
    );

    return {
      predictedCategories,
      predictedDifficulties,
    };
  }
}
