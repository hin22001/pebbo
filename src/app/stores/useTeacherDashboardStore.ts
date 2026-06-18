import { create } from "zustand";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export interface TeacherClassroom {
  classroom_id?: string;
  id?: string;
  name?: string;
  classroom_name?: string;
  student_count?: number;
  students_count?: number;
  total_students?: number;
}

export interface TeacherAssignment {
  quiz_id?: string | number;
  id?: string | number;
  quiz_name?: string;
  name?: string;
  title?: string;
  completed_students?: number;
  completed?: number;
  done?: number;
  total_students?: number;
  total?: number;
  student_count?: number;
  status?: "upcoming" | "active" | "completed";
  created_date?: string;
  start_date?: string;
  end_date?: string;
}

export interface TeacherStudent {
  student_id?: string;
  user_id?: string;
  id?: string;
  name?: string;
  display_name?: string;
  full_name?: string;
  avg_score?: number;
  average_score?: number;
  score?: number;
  classroom_id?: string;
}

interface TeacherDashboardState {
  classrooms: TeacherClassroom[];
  assignments: TeacherAssignment[];
  students: TeacherStudent[];
  classroomMap: Record<string, string>;
  loading: boolean;
  error: string | null;
  timestamp: number | null;
  pendingFetch: Promise<void> | null;

  fetchAll: (force?: boolean) => Promise<void>;
  invalidate: () => void;
}

const CACHE_TTL = 60 * 1000; // 1 minute — teacher data mutates often

const useTeacherDashboardStore = create<TeacherDashboardState>((set, get) => ({
  classrooms: [],
  assignments: [],
  students: [],
  classroomMap: {},
  loading: false,
  error: null,
  timestamp: null,
  pendingFetch: null,

  fetchAll: async (force = false) => {
    const state = get();
    const now = Date.now();
    const fresh =
      state.timestamp !== null && now - state.timestamp < CACHE_TTL;

    // Cache hit
    if (!force && fresh && state.classrooms.length > 0) {
      return;
    }

    // In-flight dedupe — concurrent callers share the same network round-trip
    if (state.pendingFetch) {
      return state.pendingFetch;
    }

    const promise = (async () => {
      set({ loading: get().timestamp === null, error: null });

      try {
        const [classroomsRes, studentsRes, assignmentsRes] = await Promise.all(
          [
            TeacherAPI.getClassrooms({ page_number: 1, rows_per_page: 50 }),
            TeacherAPI.getStudentsSummary({
              page_number: 1,
              rows_per_page: 20,
            }).catch(() => null),
            TeacherAPI.getQuizCompletion({
              page_number: 1,
              rows_per_page: 20,
            }).catch(() => null),
          ]
        );

      const classroomsData =
        classroomsRes?.classrooms ?? classroomsRes ?? [];
      const classrooms: TeacherClassroom[] = Array.isArray(classroomsData)
        ? classroomsData
        : [];

      const studentsData = studentsRes?.students ?? studentsRes ?? [];
      const students: TeacherStudent[] = Array.isArray(studentsData)
        ? studentsData
        : [];

      const classroomMap: Record<string, string> = {};
      classrooms.forEach((c) => {
        const id = c.classroom_id || c.id;
        const cname = c.name || c.classroom_name || "";
        if (id) classroomMap[id] = cname;
      });

      const quizzesData =
        assignmentsRes?.quizzes ??
        (Array.isArray(assignmentsRes) ? assignmentsRes : []) ??
        [];
      const assignmentsRaw: TeacherAssignment[] = Array.isArray(quizzesData)
        ? quizzesData
        : [];
      const statusRank: Record<string, number> = {
        active: 0,
        upcoming: 1,
        completed: 2,
      };
      const assignments = [...assignmentsRaw].sort((a, b) => {
        const sa = statusRank[a.status ?? "completed"] ?? 3;
        const sb = statusRank[b.status ?? "completed"] ?? 3;
        if (sa !== sb) return sa - sb;
        const da = new Date(a.created_date ?? 0).getTime();
        const db = new Date(b.created_date ?? 0).getTime();
        return db - da;
      });

        set({
          classrooms,
          students,
          classroomMap,
          assignments,
          loading: false,
          timestamp: Date.now(),
          error: null,
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load dashboard";
        set({ loading: false, error: msg });
      } finally {
        set({ pendingFetch: null });
      }
    })();

    set({ pendingFetch: promise });
    return promise;
  },

  invalidate: () => {
    set({ timestamp: null });
    void get().fetchAll(true);
  },
}));

export default useTeacherDashboardStore;
