import { NextRequest, NextResponse } from "next/server";
import { db, adminUsernames } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Default admin username - shreyaspapi is the first admin
const DEFAULT_ADMIN = "shreyaspapi";

// GET all admin usernames
export async function GET() {
  try {
    const result = await db.select().from(adminUsernames);
    
    // If no admins in DB, seed the default admin and return
    if (result.length === 0) {
      await db.insert(adminUsernames).values({
        id: randomUUID(),
        username: DEFAULT_ADMIN,
      });
      return NextResponse.json([DEFAULT_ADMIN]);
    }
    
    return NextResponse.json(result.map(a => a.username));
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

// POST add an admin username
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Check if already exists (case insensitive)
    const existing = await db.select().from(adminUsernames);
    const alreadyExists = existing.some(
      a => a.username.toLowerCase() === username.toLowerCase()
    );

    if (alreadyExists) {
      return NextResponse.json({ message: "Admin already exists" });
    }

    await db.insert(adminUsernames).values({
      id: randomUUID(),
      username,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding admin:", error);
    return NextResponse.json({ error: "Failed to add admin" }, { status: 500 });
  }
}

// DELETE remove an admin username
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Find and delete (case insensitive)
    const existing = await db.select().from(adminUsernames);
    const toDelete = existing.find(
      a => a.username.toLowerCase() === username.toLowerCase()
    );

    if (toDelete) {
      await db.delete(adminUsernames).where(eq(adminUsernames.id, toDelete.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing admin:", error);
    return NextResponse.json({ error: "Failed to remove admin" }, { status: 500 });
  }
}
