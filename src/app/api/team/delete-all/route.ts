import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    await prisma.teamMember.deleteMany({
      where: {
        userId: session.user.id
      }
    });

    return new Response(JSON.stringify({ message: 'All team members deleted' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting all team members:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete team members' }), {
      status: 500,
    });
  }
} 