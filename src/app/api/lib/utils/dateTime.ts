export class DateTime {
  static getPastDate(dateString: string, decrementBy: number): string {
    const currentDate = new Date(dateString);
    currentDate.setDate(currentDate.getDate() - decrementBy);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  static getFutureDate(dateString: string, incrementBy: number): string {
    const currentDate = new Date(dateString);
    currentDate.setDate(currentDate.getDate() + incrementBy);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  static getDayOfWeek(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  static DaysofWeek() {
    return [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
  }
}
