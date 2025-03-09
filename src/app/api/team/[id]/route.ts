import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify that this team member belongs to the current user
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    const { status } = await req.json();

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either 'active' or 'inactive'" },
        { status: 400 }
      );
    }

    const teamMember = await prisma.teamMember.update({
      where: { 
        id: params.id,
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify that this team member belongs to the current user
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    const deletedMember = await prisma.teamMember.delete({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    });

    return NextResponse.json(deletedMember);
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
} 