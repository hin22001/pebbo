import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export class ArrayHelper {
  static getDecreasingArray(
    length: number,
    firstValue: number,
    lastValue: number,
  ): number[] {
    if (length < 2) {
      throw new Error("Length must be at least 2 to create a sequence.");
    }

    const array: number[] = new Array(length);
    const step = (firstValue - lastValue) / (length - 1);

    for (let i = 0; i < length; i++) {
      array[i] = parseFloat((firstValue - i * step).toFixed(2));
    }

    return array;
  }

  static getLinearArray(length: number, value: number): number[] {
    return new Array(length).fill(value);
  }

  static elementWiseMultiply(a: number[], b: number[]): number[] {
    if (a.length !== b.length) {
      throw new FlexibleError("Array length mismatch", 500);
    }

    return a.map((value, index) => value * b[index]);
  }

  static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  static applySigmoid(arr: number[]): number[] {
    const result = arr.map(this.sigmoid);
    return result;
  }

  static applyThreshold(arr: Float32Array, threshold: number): Float32Array {
    const result = arr.map((value) => (value > threshold ? 1 : 0));
    return result;
  }

  static reshapeTo2D(originalArray: number[], length: number): number[][] {
    const newArray: number[][] = [];
    let tempArray: number[] = [...originalArray];

    while (tempArray.length) {
      newArray.push(tempArray.slice(0, length));
      tempArray = tempArray.slice(length);
    }

    return newArray;
  }

  static argmax(array: number[]): number {
    return array.reduce((maxIndex, currentValue, currentIndex, arr) => {
      return currentValue > arr[maxIndex] ? currentIndex : maxIndex;
    }, 0);
  }

  static getRandomNonZeroIndex(array: number[]): number | null {
    const nonZeroIndices = array
      .map((value, index) => (value !== 0 ? index : -1))
      .filter((index) => index !== -1);

    if (nonZeroIndices.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * nonZeroIndices.length);
    return nonZeroIndices[randomIndex];
  }

  static filterIndicesByValue(array: number[], indices: number[]): number[] {
    return indices.filter((index) => array[index] !== 0.0);
  }

  static incrementArray(array: number[]): number[] {
    return array.map((value) => value + 1);
  }

  static getSumByReducation(array: any, key: string): number {
    if (!array.length) return 0;

    return array.reduce((sum, obj) => sum + obj[key], 0);
  }

  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
