
import React from 'react';
import { GameExperience } from '../types';

interface GameCardProps {
  game: GameExperience;
  variant?: 'default' | 'large';
  onPlay?: (game: GameExperience) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, variant = 'default', onPlay }) => {
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) onPlay(game);
  };

  if (variant === 'large') {
    return (
      <div 
        onClick={() => onPlay?.(game)}
        className="group relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/5 hover:border-blue-500/50 transition-all cursor-pointer"
      >
        <div className="aspect-[16/9] overflow-hidden">
          <img 
            src={game.thumbnail} 
            alt={game.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
            <button 
              onClick={handlePlay}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2"
            >
              <i className="fas fa-play"></i> Play Remake
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors">{game.title}</h4>
            <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
              <i className="fas fa-thumbs-up"></i>
              {game.rating}%
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">{game.developer}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            {game.activePlayers} Playing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onPlay?.(game)}
      className="group cursor-pointer transition-all"
    >
      <div className="aspect-square rounded-xl overflow-hidden mb-3 border border-white/5 group-hover:border-blue-500/50 relative">
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-green-400">
          {game.rating}%
        </div>
      </div>
      <h4 className="font-bold text-sm truncate mb-0.5 group-hover:text-blue-400 transition-colors">{game.title}</h4>
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
        <i className="fas fa-users text-[8px]"></i>
        {game.activePlayers}
      </div>
    </div>
  );
};

export default GameCard;
