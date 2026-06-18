export class PostgresFormatter {
  static arrayToEnumArray(array: string[]): string {
    const processedSubjects = array.join(", ");
    return `{${processedSubjects}}`;
  }
}
