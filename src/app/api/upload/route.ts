import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"

const redis = Redis.fromEnv()

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "24 h"),
  prefix: "upload",
})

const SHORT_URL_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1"

  const { success, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: "Upload limit reached. You can upload up to 20 strips per day." },
      { status: 429 },
    )
  }

  const formData = await request.formData()
  const file = formData.get("image") as File | null

  if (!file) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const isJpeg = file.type === "image/jpeg" || file.name.endsWith(".jpg")
  const ext = isJpeg ? "jpg" : "png"
  const contentType = isJpeg ? "image/jpeg" : "image/png"
  const stripRef = ref(storage, `strips/${crypto.randomUUID()}.${ext}`)

  await uploadBytes(stripRef, buffer, { contentType })
  const firebaseUrl = await getDownloadURL(stripRef)

  // Store short ID → Firebase URL in Redis with 30-day expiry
  const shortId = crypto.randomUUID().slice(0, 8)
  await redis.set(`short:${shortId}`, firebaseUrl, { ex: SHORT_URL_TTL_SECONDS })

  const origin = request.headers.get("origin") ?? ""
  const shortUrl = `${origin}/s/${shortId}`

  return NextResponse.json({ url: shortUrl, remaining })
}
