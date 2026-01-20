
import React, { useState, useEffect } from 'react';
import { fetchCollectibles } from '../geminiService';
import { CatalogItem } from '../types';

const CatalogView: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCollectibles();
        setItems(data.items);
        setSources(data.sources);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden">
      {/* Sidebar Filters */}
      <aside className="w-64 border-r border-white/5 pr-8 hidden lg:block overflow-y-auto">
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Category</h3>
            <ul className="space-y-3 text-sm font-semibold">
              <li className="text-blue-400">Collectibles</li>
              <li className="text-gray-400 hover:text-white cursor-pointer">All Categories</li>
              <li className="text-gray-400 hover:text-white cursor-pointer">Clothing</li>
              <li className="text-gray-400 hover:text-white cursor-pointer">Body Parts</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Price</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Min" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs" />
              <input type="text" placeholder="Max" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Sales Type</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked className="w-4 h-4 bg-blue-600 rounded" />
                <span>Collectibles</span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-8 overflow-y-auto pb-20">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter">Marketplace</h1>
          <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Collectibles & Limiteds</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => item.link && window.open(item.link, '_blank')}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-square bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center justify-center text-7xl p-8 group-hover:border-blue-500 transition-all relative overflow-hidden mb-3">
                  {item.icon || '💎'}
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Limited Tags */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {item.isLimited && (
                      <div className="bg-[#1b1b1b] border border-[#ff5555]/50 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg">
                        <div className="w-2 h-2 bg-gradient-to-br from-red-500 to-red-800 rounded-sm"></div>
                        <span className="text-[10px] font-black text-red-500 uppercase italic">Limited</span>
                      </div>
                    )}
                    {item.isLimitedU && (
                      <div className="bg-[#1b1b1b] border border-[#ffaa00]/50 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg">
                        <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm"></div>
                        <span className="text-[10px] font-black text-yellow-500 uppercase italic">Limited U</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="font-bold text-sm leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem]">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[9px] text-white">R$</div>
                    <span className="text-green-400 text-sm font-black">{item.price}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Resellers: {Math.floor(Math.random() * 50) + 1}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {sources.length > 0 && (
          <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl">
            <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest">Search Grounding</h4>
            <div className="flex flex-wrap gap-4">
              {sources.map((chunk, i) => chunk.web && (
                <a key={i} href={chunk.web.uri} target="_blank" className="text-[10px] text-blue-400 flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-all">
                  <i className="fas fa-globe"></i> {chunk.web.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogView;
