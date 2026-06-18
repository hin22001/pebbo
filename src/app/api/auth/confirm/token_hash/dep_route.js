// 'use server'

// import tokenhashSchema from '@/src/app/api/lib/schemas/tokenhashSchema';
// import { createSupabaseAuth } from '@/src/app/api/lib/supabase/dep_supabaseAuth';
// import { getReqBody } from '@/src/app/api/lib/utils/getReqBody';
// import trySchema from '@/src/app/api/lib/utils/trySchema';
// import { NextResponse } from 'next/server'

// export async function POST(req) {
//   try {
//     const { body } = await getReqBody(req);

//     const { validatedBody } = await trySchema(body, tokenhashSchema);

//     const supabase = createSupabaseAuth();

//     const { error } = await supabase.auth.verifyOtp({
//       type: validatedBody.type,
//       token_hash: validatedBody.token_hash
//     })

//     if(error) throw error;

//     return NextResponse.json({ status: 200, message: `Success confirm token hash`, data: null }, { status: 200 })
//   }
//   catch(err) {
//     return NextResponse.json({ status: err.status ?? 500, message: `Failed confirm token hash: ${err.message}`, data: null }, { status: err.status ?? 500 })
//   }
// }
