import { NextRequest, NextResponse } from "next/server"
import { dateStore } from "@/lib/date-store"
import type { DateProposal } from "@/lib/types"

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

    const {
      matchId,
      matchName,
      dateTime,
      activity,
      venue,
      location,
      description,
      glimpseId
    } = body

    // Validate required fields
    if (!matchId || !matchName || !dateTime || !activity || !location || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: matchId, matchName, dateTime, activity, location, description"
        },
        { status: 400 }
      )
    }

    // Create date proposal
    const proposal: DateProposal = {
      id: `date_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matchId,
      matchName,
      proposedBy: "matchmaker",
      dateTime: new Date(dateTime),
      activity,
      venue,
      location,
      description,
      status: "proposed",
      userResponse: "pending",
      matchResponse: "accepted", // For now, matches auto-accept (single-user MVP)
      accommodations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      glimpseId
    }

    // Save to store
    dateStore.save(proposal)

    console.log("Date proposal created:", proposal.id)

    return NextResponse.json({
      success: true,
      proposal
    })

  } catch (error) {
    console.error("Error creating date proposal:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create date proposal"
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve date proposals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")
    const status = searchParams.get("status")
    const proposalId = searchParams.get("id")

    // Get specific proposal by ID
    if (proposalId) {
      const proposal = dateStore.get(proposalId)
      if (!proposal) {
        return NextResponse.json(
          {
            success: false,
            error: "Date proposal not found"
          },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        proposal
      })
    }

    // Get proposals by match
    if (matchId) {
      const proposals = dateStore.getByMatch(matchId)
      return NextResponse.json({
        success: true,
        proposals
      })
    }

    // Get proposals by status
    if (status) {
      const proposals = dateStore.getByStatus(status as DateProposal["status"])
      return NextResponse.json({
        success: true,
        proposals
      })
    }

    // Get all proposals
    const proposals = dateStore.getAll()
    return NextResponse.json({
      success: true,
      proposals
    })

  } catch (error) {
    console.error("Error retrieving date proposals:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve date proposals"
      },
      { status: 500 }
    )
  }
}
