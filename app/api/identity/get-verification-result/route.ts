import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      )
    }

    // Retrieve the verification session
    const verificationSession = await stripe.identity.verificationSessions.retrieve(
      sessionId,
      {
        expand: ["verified_outputs"],
      }
    )

    // Check if verification was successful
    if (verificationSession.status !== "verified") {
      return NextResponse.json({
        success: false,
        error: "Verification not completed",
        status: verificationSession.status,
      })
    }

    // Extract verified data
    const verifiedOutputs = verificationSession.verified_outputs

    // Calculate age from date of birth
    const calculateAge = (dob: { day: number; month: number; year: number }) => {
      const today = new Date()
      const birthDate = new Date(dob.year, dob.month - 1, dob.day)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }

    // Format the verified data
    const verifiedData = {
      name: verifiedOutputs?.first_name && verifiedOutputs?.last_name
        ? `${verifiedOutputs.first_name} ${verifiedOutputs.last_name}`
        : null,
      firstName: verifiedOutputs?.first_name || null,
      lastName: verifiedOutputs?.last_name || null,
      dateOfBirth: verifiedOutputs?.dob
        ? `${verifiedOutputs.dob.year}-${String(verifiedOutputs.dob.month).padStart(2, "0")}-${String(verifiedOutputs.dob.day).padStart(2, "0")}`
        : null,
      age: verifiedOutputs?.dob ? calculateAge(verifiedOutputs.dob).toString() : null,
      address: verifiedOutputs?.address?.line1 || null,
      city: verifiedOutputs?.address?.city || null,
      state: verifiedOutputs?.address?.state || null,
      postalCode: verifiedOutputs?.address?.postal_code || null,
      country: verifiedOutputs?.address?.country || null,
    }

    return NextResponse.json({
      success: true,
      verifiedData,
      verificationId: verificationSession.id,
    })
  } catch (error) {
    console.error("Stripe Identity retrieval error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve verification result",
      },
      { status: 500 }
    )
  }
}
