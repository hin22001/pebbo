import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PebboDatabase } from "@/src/app/api/lib/types/supabaseTypesOverride";

export class Supabase {
  private url: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  private public_key: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  private service_key: string = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  constructor() {}

  getServiceClient(): SupabaseClient<PebboDatabase, "public"> {
    return createClient<PebboDatabase>(this.url, this.service_key);
  }

  getAuthClient(): SupabaseClient<PebboDatabase, "public"> {
    const cookieStore = cookies();

    return createServerClient<PebboDatabase>(this.url, this.public_key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },

      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    });
  }
}
