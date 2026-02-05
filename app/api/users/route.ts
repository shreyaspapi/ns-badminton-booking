import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET all users or a specific user by discordId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get("discordId");

    if (discordId) {
      const result = await db.select().from(users).where(eq(users.discordId, discordId));
      if (result.length === 0) {
        return NextResponse.json(null);
      }
      return NextResponse.json(result[0]);
    }

    const result = await db.select().from(users);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST create or update a user (upsert)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, discordId, discordUsername, discordAvatar, skillLevel, isAdmin, hasCompletedOnboarding } = body;

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.discordId, discordId));

    if (existing.length > 0) {
      // Update existing user - only update fields that are provided
      const updateData: Record<string, unknown> = {
        discordUsername,
        discordAvatar,
        updatedAt: new Date(),
      };
      
      // Only update these fields if they are explicitly provided
      if (skillLevel !== undefined) updateData.skillLevel = skillLevel;
      if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
      if (hasCompletedOnboarding !== undefined) updateData.hasCompletedOnboarding = hasCompletedOnboarding;
      
      const updated = await db.update(users)
        .set(updateData)
        .where(eq(users.discordId, discordId))
        .returning();
      return NextResponse.json(updated[0]);
    }

    // Create new user
    const newUser = await db.insert(users).values({
      id,
      discordId,
      discordUsername,
      discordAvatar,
      skillLevel: skillLevel || null,
      isAdmin: isAdmin || false,
      hasCompletedOnboarding: hasCompletedOnboarding || false,
    }).returning();

    return NextResponse.json(newUser[0]);
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
