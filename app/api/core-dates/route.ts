import { NextRequest, NextResponse } from "next/server";
import { db, unblockedCoreDates } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET all unblocked core dates
export async function GET() {
  try {
    const result = await db.select().from(unblockedCoreDates);
    return NextResponse.json(result.map(d => d.date));
  } catch (error) {
    console.error("Error fetching core dates:", error);
    return NextResponse.json({ error: "Failed to fetch core dates" }, { status: 500 });
  }
}

// POST unblock a core date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    // Check if already exists
    const existing = await db.select().from(unblockedCoreDates).where(eq(unblockedCoreDates.date, date));

    if (existing.length > 0) {
      return NextResponse.json({ message: "Date already unblocked" });
    }

    await db.insert(unblockedCoreDates).values({
      id: randomUUID(),
      date,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unblocking date:", error);
    return NextResponse.json({ error: "Failed to unblock date" }, { status: 500 });
  }
}

// DELETE block a core date (remove from unblocked list)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    await db.delete(unblockedCoreDates).where(eq(unblockedCoreDates.date, date));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error blocking date:", error);
    return NextResponse.json({ error: "Failed to block date" }, { status: 500 });
  }
}
