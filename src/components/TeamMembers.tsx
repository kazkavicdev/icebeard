'use client';

import { useState, useEffect } from 'react';

interface TeamMember {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team');
      if (!response.ok) throw new Error('Failed to fetch team members');
      const data = await response.json();
      setTeamMembers(data);
      setError('');
    } catch (err) {
      setError('Failed to load team members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newMemberName, status: 'active' }),
      });

      const data = await response.json();
      console.log('Server response:', { status: response.status, data });
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add team member');
      }

      setTeamMembers(prev => [...prev, data]);
      setNewMemberName('');
      setShowAddForm(false);
      setError('');
    } catch (err) {
      console.error('Full error details:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error'
      });
      setError(err instanceof Error ? err.message : 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update team member status');

      const updatedMember = await response.json();
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === id ? updatedMember : member
        )
      );
      setError('');
    } catch (err) {
      setError('Failed to update team member status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete team member');
      
      setTeamMembers(prev => prev.filter(member => member.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete team member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllMembers = async () => {
    if (!confirm('Are you sure you want to delete all team members? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/team/delete-all', {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete all team members');
      
      setTeamMembers([]);
      setError('');
    } catch (err) {
      setError('Failed to delete all team members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Member
          </button>
          {teamMembers.length > 0 && (
            <button
              onClick={handleDeleteAllMembers}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddMember} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Enter member name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewMemberName('');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <div className="text-center py-4">Loading...</div>}

      <div className="space-y-2">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <span className="font-medium">{member.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStatus(member.id, member.status)}
                disabled={loading}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  member.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {member.status === 'active' ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => handleDeleteMember(member.id)}
                disabled={loading}
                className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 