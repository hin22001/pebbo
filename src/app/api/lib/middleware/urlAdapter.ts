import { ZodSchema, ZodError, TypeOf } from "zod";
import { FlexibleError } from "@/app/api/lib/utils/flexibleError";

export class URLAdapter<S extends ZodSchema<any>> {
  private raw_request: Request;
  private urlParams: Partial<TypeOf<S>>; // Infer the type from the schema
  private schema: S;

  constructor(req: Request, schema: S) {
    this.raw_request = req;
    this.urlParams = {};
    this.schema = schema;
  }

  init() {
    const { searchParams } = new URL(this.raw_request.url);

    searchParams.forEach((value, key) => {
      this.urlParams[key as keyof TypeOf<S>] = value;
    });

    // Validate the collected parameters using the zod schema
    try {
      this.urlParams = this.schema.parse(this.urlParams) as Partial<TypeOf<S>>;
    } catch (err) {
      if (err instanceof ZodError) {
        throw new FlexibleError(`Validation Error`, 400);
      } else {
        throw new FlexibleError(`Something went wrong`, 500);
      }
    }
  }

  getURLObject(): TypeOf<S> {
    return this.urlParams as TypeOf<S>;
  }

  getURLProperty<K extends keyof TypeOf<S>>(property: K): TypeOf<S>[K] {
    return this.urlParams[property];
  }
}
