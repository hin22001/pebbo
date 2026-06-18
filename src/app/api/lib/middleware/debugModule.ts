import { SystemAdmin } from "@/src/app/api/lib/utils/systemAdmin";
import { AbstractDebug } from "../abstractClasses/abstractDebug";

export class DebugModule<T extends object> {
  private target: AbstractDebug<T>;

  constructor(target: AbstractDebug<T>) {
    this.target = target;
  }

  checkDebug(isDebug: boolean, debugAPIKey: string, debugObject: T) {
    if (isDebug) {
      SystemAdmin.assertAdminKey(debugAPIKey);
      this.target.injectDebug(debugObject);
    }
  }
}
