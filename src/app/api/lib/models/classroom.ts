import { ClassroomData } from "@/src/app/api/lib/types/classroomTypes";

export class Classroom {
  private classroom_id: number;
  private school_id: number;
  private classroom_name: string;
  private archived: boolean;

  constructor(
    classroom_id: number,
    school_id: number,
    classroom_name: string,
    archived: boolean,
  );
  constructor(classroomData: ClassroomData);

  constructor(
    classroom_id_or_data: number | ClassroomData,
    school_id?: number,
    classroom_name?: string,
    archived?: boolean,
  ) {
    if (typeof classroom_id_or_data === "number") {
      this.classroom_id = classroom_id_or_data;
      this.school_id = school_id!;
      this.classroom_name = classroom_name!;
      this.archived = archived!;
    } else {
      this.classroom_id = classroom_id_or_data.classroom_id;
      this.school_id = classroom_id_or_data.school_id;
      this.classroom_name = classroom_id_or_data.classroom_name;
      this.archived = classroom_id_or_data.archived;
    }
  }

  getClassroomId() {
    return this.classroom_id;
  }
}
