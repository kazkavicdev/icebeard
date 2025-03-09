'use client';

import { useState, useEffect } from 'react';

interface TeamMember {
  id: string;
  name: string;
  status: string;
}

const EMOJI_SETS = {
  animals: {
    question: "Pick an animal that describes you today:",
    emojis: [
      { emoji: "🦁", name: "Lion - natural born leader" },
      { emoji: "🦊", name: "Fox - smart and adaptable" },
      { emoji: "🐢", name: "Turtle - steady and reliable" },
      { emoji: "🦋", name: "Butterfly - in transformation" },
      { emoji: "🦉", name: "Owl - night thinker" },
      { emoji: "🐝", name: "Bee - super productive" },
      { emoji: "🦅", name: "Eagle - high achiever" },
      { emoji: "🐼", name: "Panda - chill and relaxed" },
      { emoji: "🐬", name: "Dolphin - playful and friendly" },
      { emoji: "🦄", name: "Unicorn - feeling special" },
      { emoji: "🐌", name: "Snail - taking it slow" },
      { emoji: "🦆", name: "Duck - going with the flow" },
      { emoji: "🦁", name: "Lion - feeling powerful" },
      { emoji: "🐵", name: "Monkey - full of energy" },
      { emoji: "🦈", name: "Shark - unstoppable" }
    ]
  },
  transport: {
    question: "Pick a transport that matches your energy today:",
    emojis: [
      { emoji: "🚀", name: "Rocket - sky-high energy" },
      { emoji: "🚂", name: "Train - steady and reliable" },
      { emoji: "🚲", name: "Bicycle - eco-friendly pace" },
      { emoji: "🏃", name: "Runner - self-powered" },
      { emoji: "🚗", name: "Car - in control" },
      { emoji: "🛵", name: "Scooter - quick and agile" },
      { emoji: "🚁", name: "Helicopter - overseeing everything" },
      { emoji: "🚶", name: "Walking - taking it easy" },
      { emoji: "⛵", name: "Sailboat - going with the flow" },
      { emoji: "🏎️", name: "Race car - super charged" },
      { emoji: "🚌", name: "Bus - team player" },
      { emoji: "🛸", name: "UFO - feeling otherworldly" },
      { emoji: "🚤", name: "Speedboat - cutting through" },
      { emoji: "🦽", name: "Wheelchair - persistent" },
      { emoji: "🛹", name: "Skateboard - cool and casual" }
    ]
  },
  sports: {
    question: "Which sport describes you today?",
    emojis: [
      { emoji: "⚽", name: "Soccer - team player" },
      { emoji: "🎾", name: "Tennis - precise and focused" },
      { emoji: "🏊‍♂️", name: "Swimming - going with the flow" },
      { emoji: "🏃‍♂️", name: "Running - on my own path" },
      { emoji: "🧗‍♀️", name: "Climbing - overcoming challenges" },
      { emoji: "🏄‍♂️", name: "Surfing - riding the waves" },
      { emoji: "🤸‍♂️", name: "Gymnastics - flexible and balanced" },
      { emoji: "🏋️‍♂️", name: "Weight lifting - feeling strong" },
      { emoji: "🎯", name: "Darts - focused on targets" },
      { emoji: "⛳", name: "Golf - strategic and patient" },
      { emoji: "🥋", name: "Martial arts - disciplined" },
      { emoji: "🧘‍♂️", name: "Yoga - mindful and centered" },
      { emoji: "🤾‍♂️", name: "Handball - dynamic and fast" },
      { emoji: "🏹", name: "Archery - aiming high" },
      { emoji: "🏂", name: "Snowboarding - adventurous" }
    ]
  }
};

export default function EmojiGame() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pickedMembers, setPickedMembers] = useState<TeamMember[]>([]);
  const [currentPick, setCurrentPick] = useState<TeamMember | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentEmojis, setCurrentEmojis] = useState<{
    question: string;
    emojis: typeof EMOJI_SETS.animals.emojis;
  } | null>(null);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team');
      if (!response.ok) throw new Error('Failed to fetch team members');
      const data = await response.json();
      setTeamMembers(data.filter((member: TeamMember) => member.status === 'active'));
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

  const getRandomEmojis = () => {
    const sets = Object.keys(EMOJI_SETS) as (keyof typeof EMOJI_SETS)[];
    const randomSet = sets[Math.floor(Math.random() * sets.length)];
    const emojiSet = EMOJI_SETS[randomSet];
    
    const shuffled = [...emojiSet.emojis].sort(() => 0.5 - Math.random());
    return {
      question: emojiSet.question,
      emojis: shuffled.slice(0, 6)
    };
  };

  const handlePickRandomMember = () => {
    const availableMembers = teamMembers.filter(
      member => !pickedMembers.some(picked => picked.id === member.id)
    );

    if (availableMembers.length === 0) {
      setError('All team members have been picked!');
      setCurrentPick(null);
      setCurrentEmojis(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableMembers.length);
    const pickedMember = availableMembers[randomIndex];
    
    setCurrentPick(pickedMember);
    setPickedMembers(prev => [...prev, pickedMember]);
    setCurrentEmojis(getRandomEmojis());
    setError('');
  };

  const resetPicks = () => {
    setPickedMembers([]);
    setCurrentPick(null);
    setCurrentEmojis(null);
    setError('');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Emoji Game - Express yourself with emojis</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePickRandomMember}
            disabled={loading || teamMembers.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pick Random Member
          </button>
          {pickedMembers.length > 0 && (
            <button
              onClick={resetPicks}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {currentPick && currentEmojis && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="font-bold text-xl mb-2">
            {currentPick.name}
          </div>
          <div className="text-lg mb-4">
            {currentEmojis.question}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentEmojis.emojis.map((emoji, index) => (
              <div 
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center"
              >
                <div className="text-4xl mb-2">{emoji.emoji}</div>
                <div className="text-sm text-gray-600">{emoji.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pickedMembers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Previous Picks</h3>
          <div className="space-y-2">
            {pickedMembers.map((member, index) => (
              <div 
                key={member.id}
                className="bg-gray-50 p-3 rounded-md"
              >
                {index + 1}. {member.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 