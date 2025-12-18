import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 })
    }

    const isSecure = (request.headers.get("x-forwarded-proto") ?? "http") === "https"
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set("sb-access-token", access_token, cookieOptions)
    res.cookies.set("sb-refresh-token", refresh_token, cookieOptions)
    return res
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
