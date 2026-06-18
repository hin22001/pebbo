import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

type NullHandlingOptions<T> = {
  shouldThrow: boolean;
  defaultValue?: T;
};

export class TypeGuard {
  static ensureDefined(value: any, message: string): any {
    if (value === undefined) {
      throw new FlexibleError(message, 500);
    }
    return value;
  }

  static ensureBoolArray(array: number[], message: string): void {
    if (array.every((bool_) => bool_ === 0 || bool_ === 1)) {
      return;
    } else {
      throw new FlexibleError(message, 400);
    }
  }

  static accessNullable<T>(
    value: T | null,
    message: string,
    options: NullHandlingOptions<T>,
  ) {
    const { shouldThrow, defaultValue } = options;

    if (value === null) {
      if (shouldThrow) {
        throw new FlexibleError(message, 500);
      } else {
        if (defaultValue === undefined) {
          throw new FlexibleError(`${message}: defaultValue is undefined`, 500);
        }
        return defaultValue;
      }
    }
    return value as T;
  }
}
