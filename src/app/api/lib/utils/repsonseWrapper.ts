import { NextResponse } from "next/server";

export class ResponseWrapper {
  static success(
    message: string = "Success",
    data: any = null,
    status: number = 200,
    headers: Record<string, string> = {},
  ) {
    return NextResponse.json({ status, message, data }, { status, headers });
  }

  static error(
    message: string,
    status: number = 500,
    errorMessage: string = "",
    data: any = null,
  ) {
    return NextResponse.json(
      {
        status,
        message: `${message} ${errorMessage}`,
        data,
      },
      { status },
    );
  }
}
