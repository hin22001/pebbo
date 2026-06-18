const path = require("path");
import { ModelDirectory } from "@/src/app/api/lib/defaults/modelDirectory";
import { InferenceSession, Tensor, TypedTensor, env } from "onnxruntime-web";

const MAX_CACHE_SIZE = 5;

/** LRU cache: Map preserves insertion order, first = oldest */
const sessionCache = new Map<string, InferenceSession>();
/** Prevents concurrent loads of the same model */
const loadPromises = new Map<string, Promise<InferenceSession>>();

function evictOldestIfNeeded(): void {
  if (sessionCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = sessionCache.keys().next().value;
    if (oldestKey) {
      sessionCache.delete(oldestKey);
    }
  }
}

export class Onnx {
  private static wasmPath: string = path.resolve(
    process.cwd(),
    "src/app/api/lib/modelInference/ort-wasm-simd.wasm",
  );
  private uint8Model: Uint8Array;
  private inferenceSession: InferenceSession;

  constructor() {
    //Set WASM mode to single-threaded
    env.wasm.numThreads = 1;
    env.wasm.wasmPaths = {
      "ort-wasm-simd.wasm": Onnx.wasmPath,
    };
  }

  /**
   *
   * @param array
   * @param shape
   * @returns Float32 Tensor
   */
  creatInputTensor(array: number[][], shape: number[]): TypedTensor<"float32"> {
    return new Tensor("float32", Float32Array.from(array.flat()), shape);
  }

  async loadModel(education_level: string, year: string): Promise<void> {
    const key = `${education_level}:${year}`;
    const cached = sessionCache.get(key);
    if (cached) {
      this.inferenceSession = cached;
      sessionCache.delete(key);
      sessionCache.set(key, cached);
      return;
    }

    let loadPromise = loadPromises.get(key);
    if (!loadPromise) {
      loadPromise = this._loadAndCreateSession(education_level, year);
      loadPromises.set(key, loadPromise);
    }

    this.inferenceSession = await loadPromise;
    evictOldestIfNeeded();
    sessionCache.set(key, this.inferenceSession);
    loadPromises.delete(key);
  }

  private async _loadAndCreateSession(
    education_level: string,
    year: string,
  ): Promise<InferenceSession> {
    const url = ModelDirectory.getPredictorModelPath(education_level, year);
    const model = await fetch(url, ModelDirectory.getHeaders());
    const arrayBuffer = await model.arrayBuffer();
    this.uint8Model = new Uint8Array(arrayBuffer);
    return InferenceSession.create(this.uint8Model);
  }

  async startInference(): Promise<void> {
    if (this.inferenceSession) return;
    throw new Error("loadModel must be called before startInference");
  }

  async runInference(inputTensor: TypedTensor<"float32">) {
    const result = await this.inferenceSession.run({ input: inputTensor });
    return result;
  }

  getOutputNames() {
    return this.inferenceSession.outputNames;
  }
}
