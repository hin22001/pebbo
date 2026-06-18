export abstract class AbstractDebug<T extends object> {
  abstract injectDebug(debugObject: T): void;
}
