import { ZodSchema, ZodError, TypeOf } from "zod";
import { FlexibleError } from "@/app/api/lib/utils/flexibleError";

export class BodyAdapter<S extends ZodSchema<any>> {
  private raw_request: Request;
  private body!: TypeOf<S>; // Infer the type from the schema
  private rawBody!: string;
  private schema: S;

  constructor(req: Request, schema: S) {
    this.raw_request = req;
    this.schema = schema;
  }

  async init() {
    try {
      const bodyText = await this.raw_request.text();
      const bodyJSON = JSON.parse(bodyText);

      // Validate the parsed body using the zod schema
      this.body = this.schema.parse(bodyJSON) as TypeOf<S>;
      this.rawBody = bodyText;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new FlexibleError("Invalid JSON", 400);
      } else if (err instanceof ZodError) {
        throw new FlexibleError(`Validation Error`, 400);
      } else {
        throw new FlexibleError(`Something went wrong`, 500);
      }
    }
  }

  getBody(): TypeOf<S> {
    return this.body;
  }

  getRawBody(): string {
    return this.rawBody;
  }

  getBodyProperty<K extends keyof TypeOf<S>>(property: K): TypeOf<S>[K] {
    return this.body[property];
  }
}

export class BodyAdapterTS<B extends object> {
  private raw_request: Request;
  private body: B;
  private rawBody: string;

  constructor(req: Request) {
    this.raw_request = req;
  }

  async init() {
    try {
      this.raw_request;
      const bodyText = await this.raw_request.text();
      const bodyJSON = JSON.parse(bodyText) as B;
      this.body = bodyJSON;
      this.rawBody = bodyText;
    } catch (err) {
      throw new FlexibleError("Bad Request", 404);
    }
  }

  getBody(): B {
    return this.body;
  }

  getRawBody(): string {
    return this.rawBody;
  }

  getBodyProperty<K extends keyof B>(property: K): B[K] {
    return this.body[String(property)];
  }
}
