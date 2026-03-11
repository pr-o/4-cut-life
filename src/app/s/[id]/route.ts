import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const firebaseUrl = await redis.get<string>(`short:${id}`)

  if (!firebaseUrl) {
    return new NextResponse("Link not found or expired.", { status: 404 })
  }

  return NextResponse.redirect(firebaseUrl, { status: 302 })
}
