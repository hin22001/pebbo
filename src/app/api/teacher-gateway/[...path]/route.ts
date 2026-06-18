import { NextRequest } from "next/server";

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3001", // Development teacher portal
  "https://teachers.pebbo.io",
  "https://pebbo.io",
  "https://teachers-portal-nine.vercel.app", // Production teacher portal
  "https://pebbo-mvp-oct.vercel.app", // Vercel deployment
  process.env.TEACHER_PORTAL_URL, // Custom teacher portal URL
].filter(Boolean); // Remove undefined values

// Function to get CORS headers based on request origin
function getCorsHeaders(origin: string | null) {
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin
      ? origin
      : allowedOrigins[0] || "http://localhost:3001",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    "Access-Control-Allow-Credentials": "true",
  };
}

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Forward GET requests to teacher APIs
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    const path = params.path.join("/");
    const url = new URL(req.url);
    const searchParams = url.search;

    // Build the target URL
    const targetUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/protected/teacher/${path}${searchParams}`;

    // Forward the request with all headers (especially cookies)
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Cookie: req.headers.get("Cookie") || "",
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("User-Agent") || "",
      },
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Gateway Error:", error);
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}

// Forward POST requests to teacher APIs
export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    const path = params.path.join("/");
    const body = await req.text();

    // Build the target URL
    const targetUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/protected/teacher/${path}`;

    // Forward the request with all headers and body
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Cookie: req.headers.get("Cookie") || "",
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("User-Agent") || "",
      },
      body: body,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Gateway Error:", error);
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}

// Forward PUT requests to teacher APIs
export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    const path = params.path.join("/");
    const body = await req.text();

    // Build the target URL
    const targetUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/protected/teacher/${path}`;

    // Forward the request with all headers and body
    const response = await fetch(targetUrl, {
      method: "PUT",
      headers: {
        Cookie: req.headers.get("Cookie") || "",
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("User-Agent") || "",
      },
      body: body,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Gateway Error:", error);
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}

// Forward DELETE requests to teacher APIs
export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    console.log("[API Gateway] DELETE request received for path:", params.path);

    const path = params.path.join("/");
    const url = new URL(req.url);
    const searchParams = url.search;

    console.log("[API Gateway] DELETE search params:", searchParams);

    // Build the target URL
    const targetUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/protected/teacher/${path}${searchParams}`;
    console.log("[API Gateway] DELETE target URL:", targetUrl);

    // Get request body if it exists
    let body;
    try {
      body = await req.text();
      console.log("[API Gateway] DELETE request body:", body);
    } catch (e) {
      body = "";
      console.log("[API Gateway] No body in DELETE request");
    }

    // Forward the request with all headers and body
    console.log(
      "[API Gateway] Sending DELETE request to target URL with body:",
      body
    );
    const response = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        Cookie: req.headers.get("Cookie") || "",
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("User-Agent") || "",
      },
      body: body || undefined,
    });

    console.log("[API Gateway] DELETE response status:", response.status);

    const data = await response.text();
    console.log("[API Gateway] DELETE response data:", data);

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Gateway Error:", error);
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
}
