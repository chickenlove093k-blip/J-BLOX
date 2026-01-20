
import React, { useState, useEffect } from 'react';
import { UserProfile, GameExperience } from '../types';
import { fetchTrendingGames } from '../geminiService';
import GameCard from './GameCard';

interface HomeViewProps {
  user: UserProfile;
  onPlay: (game: GameExperience) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ user, onPlay }) => {
  const [games, setGames] = useState<GameExperience[]>([]);
  const [loading, setLoading] = useState(true);
  
  const featuredGame: GameExperience = games[0] || {
    id: 'featured-1',
    title: 'Elemental Power Simulator',
    developer: 'JesseBlox Studio',
    thumbnail: 'https://picsum.photos/seed/elemental/600/400',
    rating: 99,
    activePlayers: '150K+',
    category: 'Adventure',
    url: 'elemental-power'
  };

  useEffect(() => {
    const load = async () => {
      const data = await fetchTrendingGames();
      setGames(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <section className="flex items-center gap-8 mb-12">
        <img src={user.avatarUrl} alt="" className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-2xl" />
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase">Welcome, {user.displayName}</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">The Infinite Engine Awaits You.</p>
        </div>
      </section>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-blue-500 font-black italic uppercase animate-pulse">Syncing with real-time multiverse...</div>
      ) : (
        <>
          <section className="relative h-[500px] rounded-[3rem] overflow-hidden group border border-white/5 shadow-2xl">
            <img src={featuredGame.thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-16 flex flex-col justify-end">
               <div className="inline-block px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl">LIVE MULTIVERSE FEATURE</div>
               <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-4">{featuredGame.title}</h2>
               <p className="text-gray-300 max-w-2xl font-medium text-lg leading-relaxed mb-10">Experience the world-renowned masterpiece remade with JesseBlox AI high-fidelity 9.4B star graphics.</p>
               <div className="flex gap-6">
                  <button 
                    onClick={() => onPlay(featuredGame)}
                    className="bg-white text-black px-12 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
                  >
                    <i className="fas fa-play"></i> PLAY NOW
                  </button>
                  <button className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-10 py-5 rounded-2xl font-black hover:bg-white/20 transition-all">DETAILS</button>
               </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Live Trending</h2>
              <button className="text-blue-400 font-black text-xs uppercase tracking-widest hover:underline">See Multiverse</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {games.slice(1).map(game => (
                <GameCard key={game.id} game={game} onPlay={onPlay} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomeView;
