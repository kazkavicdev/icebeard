'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import TeamMembers from '@/components/TeamMembers';
import MapGame from '@/components/MapGame';
import EmojiGame from '@/components/EmojiGame';

type MenuItem = 'team-members' | 'map-game' | 'emoji-game';

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>('team-members');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ 
      redirect: true, 
      callbackUrl: `${window.location.origin}/` 
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const menuItems: { id: MenuItem; label: string }[] = [
    { id: 'team-members', label: 'Team Members' },
    { id: 'map-game', label: 'Map Game' },
    { id: 'emoji-game', label: 'Emoji Game' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {session.user?.username}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Menu */}
          <div className="mb-6">
            <nav className="flex space-x-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenuItem(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeMenuItem === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="mt-6">
            {activeMenuItem === 'team-members' && <TeamMembers />}
            {activeMenuItem === 'map-game' && <MapGame />}
            {activeMenuItem === 'emoji-game' && <EmojiGame />}
          </div>
        </div>
      </div>
    </div>
  );
} 