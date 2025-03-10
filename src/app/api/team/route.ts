import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth.config";
// Get all team members for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Error fetching team members" },
      { status: 500 }
    );
  }
}

// Create a new team member
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found:', session);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Session user:', session.user);
    const { name, status } = await req.json();
    console.log('Received data:', { name, status });

    if (!name || !status) {
      return NextResponse.json(
        { error: "Name and status are required" },
        { status: 400 }
      );
    }

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either 'active' or 'inactive'" },
        { status: 400 }
      );
    }

    if (!session.user?.id) {
      console.log('No user ID in session:', session);
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        name,
        status,
        userId: session.user.id
      }
    });

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating team member" },
      { status: 500 }
    );
  }
} 