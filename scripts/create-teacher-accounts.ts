import { createClient } from "@supabase/supabase-js";

/**
 * Create teacher accounts.
 *
 * Mirrors scripts/create-student-accounts.ts but for the teacher role.
 *
 * A teacher needs three rows to be functional:
 *   1. auth.users           — created via supabase.auth.admin.createUser
 *   2. public.users         — auto-created by the auth trigger; we patch
 *                             role='teacher', school_id, paying, name
 *   3. public.teachers      — separate row keyed by teacher_id (= auth uid),
 *                             holds the teaching_subject enum array
 *
 * Reference account: ilham.s@wistkey.dev (school_id=1, teaching_subject={English}).
 *
 * Run:
 *   bun exec -- tsx scripts/create-teacher-accounts.ts
 *
 * Env required: SUPABASE_SERVICE_ROLE_KEY (and optionally NEXT_PUBLIC_SUPABASE_URL).
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qvervegypimlrnjdsnrk.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY is required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Subject = "Maths" | "English";

interface TeacherSeed {
  name: string;
  email: string;
  password: string;
  school_id: number;
  teaching_subject: Subject[];
  is_subject_head?: boolean;
  paying?: boolean;
}

const teachers: TeacherSeed[] = [
  {
    name: "Steve Teacher",
    email: "steve.teacher@pebbo.io",
    password: "password123",
    school_id: 1,
    teaching_subject: ["Maths"],
    is_subject_head: false,
    paying: true,
  },
];

async function main() {
  console.log("Creating teacher accounts...");

  for (const t of teachers) {
    console.log(`\nProcessing ${t.name} (${t.email})...`);

    const [firstName, ...rest] = t.name.split(" ");
    const lastName = rest.join(" ") || "Teacher";

    // 1. auth.users — let Supabase trigger create the public.users row.
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: t.email,
        password: t.password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: t.name,
          role: "teacher",
          school_id: t.school_id,
          teacher_name: t.name,
          teaching_subject: `{${t.teaching_subject.join(", ")}}`,
          is_subject_head: t.is_subject_head ?? false,
          email_verified: true,
        },
      });

    let userId: string | null = authData?.user?.id ?? null;

    if (authError) {
      if (
        authError.message.includes("already registered") ||
        authError.status === 422
      ) {
        console.log("Auth user already exists, looking up id...");
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find((u) => u.email === t.email);
        if (existing) {
          userId = existing.id;
          console.log(`Found existing user id: ${userId}`);
        }
      } else {
        console.error(`Auth error for ${t.name}:`, authError.message);
        continue;
      }
    } else {
      console.log(`Auth user created. id=${userId}`);
    }

    if (!userId) {
      console.error(`No user id resolved for ${t.name}; skipping.`);
      continue;
    }

    // 2. public.users — flip role/school/paying/name (trigger defaults to student/non-paying).
    const { error: usersError } = await supabase
      .from("users")
      .update({
        role: "teacher",
        school_id: t.school_id,
        paying: t.paying ?? true,
        first_name: firstName,
        last_name: lastName,
      })
      .eq("user_id", userId);

    if (usersError) {
      console.error(`public.users update failed:`, usersError.message);
      continue;
    }

    // 3. public.teachers — upsert the subject row.
    const { error: teachersError } = await supabase
      .from("teachers")
      .upsert(
        {
          teacher_id: userId,
          teaching_subject: t.teaching_subject,
          is_subject_head: t.is_subject_head ?? false,
        },
        { onConflict: "teacher_id" }
      );

    if (teachersError) {
      console.error(`public.teachers upsert failed:`, teachersError.message);
      continue;
    }

    console.log(`Done: ${t.name}`);
    console.log(`  email:    ${t.email}`);
    console.log(`  password: ${t.password}`);
    console.log(`  school:   ${t.school_id}`);
    console.log(`  subjects: ${t.teaching_subject.join(", ")}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
