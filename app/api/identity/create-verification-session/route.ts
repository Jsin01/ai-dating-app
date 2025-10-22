import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
})

export async function POST(request: NextRequest) {
  try {
    // Create a Stripe Identity VerificationSession
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      options: {
        document: {
          // Allowed document types - driver's license and passport
          allowed_types: ["driving_license", "passport"],
          // Require ID number to be collected
          require_id_number: true,
          // Require matching selfie for liveness check
          require_matching_selfie: true,
        },
      },
      // Return URL after verification (adjust based on your domain)
      return_url: `${request.headers.get("origin")}/profile?verification=complete`,
    })

    return NextResponse.json({
      success: true,
      clientSecret: verificationSession.client_secret,
      sessionId: verificationSession.id,
    })
  } catch (error) {
    console.error("Stripe Identity error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create verification session",
      },
      { status: 500 }
    )
  }
}
