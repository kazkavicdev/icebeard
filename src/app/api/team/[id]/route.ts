import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify that this team member belongs to the current user
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id
      }
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    const { status } = await request.json();

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either 'active' or 'inactive'" },
        { status: 400 }
      );
    }

    const teamMember = await prisma.teamMember.update({
      where: { 
        id: (await params).id,
        userId: session.user.id
      },
      data: { status }
    });

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Error updating team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: (await context.params).id,
        userId: session.user.id
      }
    });

    if (!teamMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await prisma.teamMember.delete({
      where: {
        id: (await context.params).id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ message: "Team member deleted" });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
} 