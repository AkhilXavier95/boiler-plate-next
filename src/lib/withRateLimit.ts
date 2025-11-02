import { NextResponse } from "next/server";
import { RateLimitResult } from "./rateLimit";

type RouteHandler = (request: Request) => Promise<NextResponse>;

interface RateLimitOptions {
  limiter: (request: Request) => Promise<RateLimitResult>;
  errorMessage?: string;
}

export function withRateLimit(
  handler: RouteHandler,
  options: RateLimitOptions
) {
  return async (request: Request): Promise<NextResponse> => {
    const rateLimitResult = await options.limiter(request);

    const retryAfterSeconds = Math.ceil(
      (rateLimitResult.reset - Date.now()) / 1000
    );
    const resetTime = new Date(rateLimitResult.reset).toISOString();

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error:
            options.errorMessage ||
            "Too many requests. Please try again later.",
          retryAfter: retryAfterSeconds
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": resetTime
          }
        }
      );
    }

    try {
      const response = await handler(request);
      response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
      response.headers.set(
        "X-RateLimit-Remaining",
        String(rateLimitResult.remaining)
      );
      response.headers.set("X-RateLimit-Reset", resetTime);
      return response;
    } catch (error) {
      console.error("Handler error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
