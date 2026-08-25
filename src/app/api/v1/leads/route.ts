import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, leadActivities, users } from "@/lib/db/schema";
import { getNextRoundRobinAssignee } from "@/lib/roundRobin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, service, budget, message, requirement } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { success: false, error: "Name and Email/Phone are required" },
        { status: 400 }
      );
    }

    // 1. Compute AI Lead Score
    let aiScore = 50;
    if (budget && Number(budget) >= 50000) aiScore += 25;
    if (service || requirement) aiScore += 15;
    if (email && phone) aiScore += 10;
    aiScore = Math.min(100, aiScore);

    // 2. Round-Robin Auto Sales Representative Assignment
    const assignedTo = (await getNextRoundRobinAssignee(1)) || 1;

    const leadRequirement = requirement || service || message || "Website Inquiry";
    const leadNotes = message ? `Website Notes: ${message}` : "";

    // 3. Insert Lead into CRM Database
    const [newLead] = await db
      .insert(clients)
      .values({
        orgId: 1,
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        requirement: leadRequirement,
        notes: leadNotes,
        status: "New Lead",
        aiScore,
        assignedTo,
        source: "Anavya Infotech Website Form",
      })
      .returning();

    // 4. Log Lead Activity Event
    await db.insert(leadActivities).values({
      clientId: newLead.id,
      userId: assignedTo || 1,
      type: "Website Form Submission",
      content: `🔥 New Lead captured automatically from Anavya Infotech Website (${newLead.requirement})`
    });

    return NextResponse.json({
      success: true,
      message: "Lead successfully captured in Anavya Infotech CRM",
      leadId: newLead.id,
      assignedTo
    });
  } catch (error: any) {
    console.error("CRM Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Allow CORS preflight requests from website domain
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  });
}
