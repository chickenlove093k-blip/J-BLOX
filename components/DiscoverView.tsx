
import React, { useState, useEffect } from 'react';
import { fetchTrendingGames } from '../geminiService';
import { GameExperience } from '../types';
import GameCard from './GameCard';

interface DiscoverViewProps {
  onPlay: (game: GameExperience) => void;
}

const DiscoverView: React.FC<DiscoverViewProps> = ({ onPlay }) => {
  const [games, setGames] = useState<GameExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTrendingGames();
      setGames(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-7xl font-black tracking-tighter italic uppercase">Multiverse</h1>
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Real-time data sourced from the depths of the internet</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {[...Array(12)].map((_, i) => <div key={i} className="aspect-square bg-white/5 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-16">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlay} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverView;
