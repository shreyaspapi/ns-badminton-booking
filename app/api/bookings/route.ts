import { NextRequest, NextResponse } from "next/server";
import { db, bookings } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET all bookings or filter by date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    let result;
    if (date) {
      result = await db.select().from(bookings).where(eq(bookings.date, date));
    } else {
      result = await db.select().from(bookings);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, timeSlot, gameType, createdBy, createdById, playerCount, players, skillLevel } = body;

    const newBooking = await db.insert(bookings).values({
      id,
      date,
      timeSlot,
      gameType,
      createdBy,
      createdById,
      playerCount,
      players,
      skillLevel,
    }).returning();

    return NextResponse.json(newBooking[0]);
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

// PUT update a booking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const updated = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

// DELETE a booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
    }

    await db.delete(bookings).where(eq(bookings.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
