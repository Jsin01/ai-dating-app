import { NextRequest, NextResponse } from "next/server"
import { dateStore } from "@/lib/date-store"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format"
        },
        { status: 400 }
      )
    }

    const { dateProposalId, action, userId } = body

    // Validate required fields
    if (!dateProposalId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: dateProposalId, action"
        },
        { status: 400 }
      )
    }

    // Validate action
    if (action !== "accept" && action !== "decline") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Must be 'accept' or 'decline'"
        },
        { status: 400 }
      )
    }

    // Get the proposal
    const proposal = dateStore.get(dateProposalId)
    if (!proposal) {
      return NextResponse.json(
        {
          success: false,
          error: "Date proposal not found"
        },
        { status: 404 }
      )
    }

    // Update user response
    const response = action === "accept" ? "accepted" : "declined"
    dateStore.updateUserResponse(dateProposalId, response)

    // Get updated proposal
    const updatedProposal = dateStore.get(dateProposalId)

    console.log(`Date proposal ${dateProposalId} ${response} by user`)

    // If both parties accepted, trigger coordination
    if (updatedProposal?.status === "both_accepted") {
      console.log(`Both parties accepted date ${dateProposalId}, ready for coordination`)
      // Note: Coordination (bookings, calendar, etc.) will be triggered by the client
    }

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: action === "accept"
        ? "Date accepted! We'll start coordinating the details."
        : "Date declined."
    })

  } catch (error) {
    console.error("Error responding to date proposal:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to respond to date proposal"
      },
      { status: 500 }
    )
  }
}
