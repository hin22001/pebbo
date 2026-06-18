import { VerifyEmailOtpParams } from "@supabase/supabase-js";
import { SignInWithPasswordlessCredentials } from "@supabase/supabase-js";
import { SignInWithPasswordCredentials } from "@supabase/supabase-js";

export type IOtpConfirm = VerifyEmailOtpParams;

export type IOtpSignIn = SignInWithPasswordlessCredentials;
export interface OtpSignIn {
  email: string;
}

export type IPasswordSignIn = SignInWithPasswordCredentials;
