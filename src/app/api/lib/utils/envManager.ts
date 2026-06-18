import { TypeGuard } from "@/src/app/api/lib/utils/typeGuard";

export class EnvManager {
  static getVariable(prod_name: string, test_name: string) {
    const envName =
      process.env.NEXT_PUBLIC_IS_PROD === "true" ? prod_name : test_name;
    return TypeGuard.ensureDefined(
      process.env[envName],
      `Env variable ${envName} not defined`,
    );
  }
}
