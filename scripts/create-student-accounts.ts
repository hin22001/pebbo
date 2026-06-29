import { createClient } from "@supabase/supabase-js";

// --- Inline Helpers to avoid importing 'server-only' dependencies ---

class ArrayHelper {
  static getDecreasingArray(
    length: number,
    firstValue: number,
    lastValue: number,
  ): number[] {
    if (length < 2) {
      throw new Error("Length must be at least 2 to create a sequence.");
    }

    const array: number[] = new Array(length);
    const step = (firstValue - lastValue) / (length - 1);

    for (let i = 0; i < length; i++) {
      array[i] = parseFloat((firstValue - i * step).toFixed(2));
    }

    return array;
  }

  static getLinearArray(length: number, value: number): number[] {
    return new Array(length).fill(value);
  }
}

class DefaultStudentData {
  private static scoreUpperLimit = 0.4;
  private static scoreLowerLimit = 0.08;

  private static score_lengths: Record<string, Record<string, number>> = {
    primary: {
      1: 16,
      2: 19,
      3: 15,
      4: 15,
      5: 14,
      6: 15,
    },
  };

  static getLength(education_level: string, year: string): number {
    return this.score_lengths[education_level][year];
  }

  static getInitialScores(education_level: string, year: string): number[] {
    const length = this.getLength(education_level, year);
    return ArrayHelper.getDecreasingArray(
      length,
      this.scoreUpperLimit,
      this.scoreLowerLimit,
    );
  }

  static getInitialEnabledCategories(
    education_level: string,
    year: string,
  ): number[] {
    const length = this.getLength(education_level, year);
    return ArrayHelper.getLinearArray(length, 1);
  }
}

// --- End Inline Helpers ---

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qvervegypimlrnjdsnrk.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY is required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  {
    name: "Li Steve",
    email: "li.steve@pebbo.io",
    password: "password123",
    education_level: "primary",
    year: "2",
    paying: true,
  },
];

async function main() {
  console.log("Creating student accounts...");

  for (const user of users) {
    console.log(`Processing ${user.name}...`);

    const nameParts = user.name.split(" ");
    const firstName = nameParts[0] || "Student";
    const lastName = nameParts.slice(1).join(" ") || "Account";

    // 1. Create Auth User with full metadata for triggers
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: user.name,
          role: "student",
          year: user.year,
          email_verified: true,
          stripe_customer_id: `cus_manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        },
      });

    if (authError) {
      console.error(
        `Error creating auth user for ${user.name}:`,
        authError.message,
      );
      if (
        authError.message.includes("already registered") ||
        authError.status === 422
      ) {
        console.log("User already likely exists, trying to fetch ID...");
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData.users.find((u) => u.email === user.email);
        if (existingUser) {
          console.log(`Found existing user ID: ${existingUser.id}`);
          await setContext(existingUser.id, user);
        }
      }
      continue;
    }

    const userId = authData.user.id;
    console.log(`Auth user created. ID: ${userId}`);

    // 2. Ensure identity is confirmed and fixed if needed (Supabase Admin SDK sometimes misses these)
    // Actually, createUser with email_confirm: true is usually enough,
    // but the triggers handle the public.users record creation.

    // 3. Update paying status in public.users (triggers default students to non-paying)
    if (user.paying) {
      console.log(`Setting paying status to true for ${user.name}...`);
      const { error: payingError } = await supabase
        .from("users")
        .update({ paying: true })
        .eq("user_id", userId);

      if (payingError) {
        console.error(`Error updating paying status:`, payingError.message);
      }
    }

    await setContext(userId, user);
  }
}

async function setContext(userId: string, user: (typeof users)[0]) {
  try {
    const initialScores = DefaultStudentData.getInitialScores(
      user.education_level,
      user.year,
    );

    const enabledCategories = DefaultStudentData.getInitialEnabledCategories(
      user.education_level,
      user.year,
    );

    const { error: rpcError } = await supabase.rpc("set_student_context", {
      _user_id: userId,
      _education_level: user.education_level,
      _year: user.year,
      _initial_scores: initialScores,
      _current_scores: initialScores,
      _enabled_categories: enabledCategories,
    });

    if (rpcError) {
      console.error(
        `Error setting context for ${user.name}:`,
        rpcError.message,
      );
    } else {
      console.log(`Successfully created/updated account for ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
    }
  } catch (err: any) {
    console.error(`Error in context setup for ${user.name}:`, err.message);
  }
}

main();
