
import React, { useState } from 'react';
import { AVATAR_ITEMS } from '../constants';
import { generateAvatarDescription, generateImageNano } from '../geminiService';

const AvatarView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'design'>('wardrobe');
  const [activeItems, setActiveItems] = useState<string[]>(['h1', 's1', 'p1']);
  const [aiTheme, setAiTheme] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Design Lab States
  const [designType, setDesignType] = useState<'Shirt' | 'Pants' | 'Accessory'>('Shirt');
  const [designPrompt, setDesignPrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [createdItems, setCreatedItems] = useState<{id: string, name: string, icon: string, url: string}[]>([]);

  const toggleItem = (id: string) => {
    setActiveItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAiSuggest = async () => {
    if (!aiTheme.trim()) return;
    setIsGenerating(true);
    try {
      const desc = await generateAvatarDescription(aiTheme);
      setAiSuggestion(desc);
    } catch (err) {
      setAiSuggestion("Failed to get suggestion. Try again!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateDesign = async () => {
    if (!designPrompt.trim()) return;
    setIsDesigning(true);
    try {
      const imageUrl = await generateImageNano(
        `Professional Roblox ${designType} texture: ${designPrompt}`, 
        "2K", 
        "clothing"
      );
      setGeneratedDesign(imageUrl);
    } catch (err) {
      alert("Multiverse synthesis failed. Please try again.");
    } finally {
      setIsDesigning(false);
    }
  };

  const publishItem = () => {
    if (!generatedDesign) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      name: `Custom ${designType}`,
      icon: designType === 'Shirt' ? '👕' : (designType === 'Pants' ? '👖' : '👒'),
      url: generatedDesign
    };
    setCreatedItems(prev => [...prev, newItem]);
    alert("ITEM PUBLISHED TO YOUR PRIVATE WARDROBE!");
    setGeneratedDesign(null);
    setDesignPrompt('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Tabs */}
      <div className="flex items-center gap-8 border-b border-white/5 pb-6">
        <button 
          onClick={() => setActiveTab('wardrobe')}
          className={`text-4xl font-black italic uppercase tracking-tighter transition-all ${activeTab === 'wardrobe' ? 'text-white' : 'text-gray-600 hover:text-white'}`}
        >
          Wardrobe
        </button>
        <button 
          onClick={() => setActiveTab('design')}
          className={`text-4xl font-black italic uppercase tracking-tighter transition-all flex items-center gap-4 ${activeTab === 'design' ? 'text-purple-500' : 'text-gray-600 hover:text-purple-400'}`}
        >
          Design Lab
          <div className="bg-purple-600/20 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-500/30 not-italic tracking-widest font-bold">NEW</div>
        </button>
      </div>

      {activeTab === 'wardrobe' ? (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Avatar Preview */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <div className="w-full aspect-[3/4] bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-2xl">
              <div className="relative w-48 h-80 bg-gray-300 rounded-lg flex flex-col items-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                <div className="w-20 h-20 bg-gray-400 rounded-full -mt-10 border-4 border-[#111] z-10 flex items-center justify-center text-4xl">
                  {activeItems.includes('h1') ? '👑' : (activeItems.includes('h2') ? '🛡️' : '👤')}
                </div>
                <div className="w-32 h-40 bg-gray-400 rounded-lg mt-2 flex items-center justify-center text-4xl">
                  {activeItems.includes('s1') ? '👕' : (activeItems.includes('s2') ? '🧥' : '⬜')}
                </div>
                <div className="flex gap-1 mt-1">
                  <div className="w-14 h-32 bg-gray-400 rounded-lg flex items-center justify-center text-3xl">
                    {activeItems.includes('p1') ? '👖' : (activeItems.includes('p2') ? '👟' : '⬜')}
                  </div>
                  <div className="w-14 h-32 bg-gray-400 rounded-lg flex items-center justify-center text-3xl">
                    {activeItems.includes('p1') ? '👖' : (activeItems.includes('p2') ? '👟' : '⬜')}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
            </div>
            <h2 className="mt-6 text-2xl font-black italic uppercase">Multiverse Profile</h2>
            <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px]">Customize your digital core</p>
          </div>

          {/* Customization Tabs */}
          <div className="flex-1 space-y-8">
            <section className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-8">
              <h3 className="text-sm font-black mb-6 flex items-center gap-3 uppercase tracking-widest text-blue-400 italic">
                <i className="fas fa-wand-magic-sparkles"></i> AI Stylist Assistant
              </h3>
              <div className="flex gap-4 mb-4">
                <input 
                  type="text" 
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                  placeholder="Describe a style (e.g. Cyberpunk Ninja)"
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-blue-500 transition-all"
                />
                <button 
                  onClick={handleAiSuggest}
                  disabled={isGenerating}
                  className="px-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 uppercase text-xs italic tracking-tighter"
                >
                  {isGenerating ? 'ANALYZING...' : 'GET STYLE'}
                </button>
              </div>
              {aiSuggestion && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-blue-200 text-sm leading-relaxed border-l-4">
                  "{aiSuggestion}"
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-4 overflow-x-auto">
                {['Hats', 'Shirts', 'Pants', 'Created'].map(tab => (
                  <button key={tab} className={`text-[11px] font-black uppercase tracking-widest ${tab === 'Hats' ? 'text-blue-400 border-b border-blue-400' : 'text-gray-500 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {AVATAR_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`relative p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all group ${
                      activeItems.includes(item.id)
                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-5xl group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div className="text-center">
                       <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{item.category}</span>
                       <span className="text-[11px] font-bold leading-tight">{item.name}</span>
                    </div>
                  </button>
                ))}
                
                {createdItems.map(item => (
                  <button
                    key={item.id}
                    className="relative p-6 rounded-3xl border border-purple-500/30 bg-purple-500/5 flex flex-col items-center gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                       <img src={item.url} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center">
                       <span className="block text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">DESIGN LAB</span>
                       <span className="text-[11px] font-bold leading-tight truncate w-full block">{item.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        /* Design Lab View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-10">
            <section className="bg-purple-600/5 border border-purple-500/20 rounded-[2.5rem] p-10 shadow-2xl">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4 text-purple-400">
                <i className="fas fa-layer-group"></i> Synthesis Engine
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Select Template</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['Shirt', 'Pants', 'Accessory'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => setDesignType(t)}
                        className={`py-4 rounded-2xl border font-black uppercase text-xs transition-all ${designType === t ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Design Concept Prompt</label>
                  <textarea 
                    value={designPrompt}
                    onChange={(e) => setDesignPrompt(e.target.value)}
                    placeholder="E.g., High-tech tactical armor with neon circuit patterns and matte black carbon fiber texture"
                    className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-sm h-32 focus:border-purple-500 outline-none resize-none transition-all placeholder:text-gray-700"
                  />
                </div>

                <button 
                  onClick={handleCreateDesign}
                  disabled={isDesigning || !designPrompt}
                  className="w-full py-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white font-black rounded-2xl transition-all shadow-2xl shadow-purple-600/20 uppercase italic text-lg tracking-tighter"
                >
                  {isDesigning ? 'SYNTHESIZING DESIGN...' : 'GENERATE CUSTOM ITEM'}
                </button>
              </div>
            </section>

            <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
               <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 italic">Creator Policy</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                 All designs created in the Lab are strictly monitored. Any brain rot memes, skibidi, or nonsensical meme trolling content will be auto-deleted from the multiverse. High fashion only.
               </p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
             <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center p-10 min-h-[500px]">
                {isDesigning ? (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-purple-600 rounded-3xl rotate-45 animate-spin-slow mx-auto shadow-[0_0_60px_rgba(147,51,234,0.3)]"></div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter animate-pulse text-purple-400">Rendering Texture...</h3>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Applying high-fidelity shaders</p>
                    </div>
                  </div>
                ) : generatedDesign ? (
                  <div className="w-full h-full flex flex-col animate-in fade-in duration-700">
                    <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8 relative group">
                       <img src={generatedDesign} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 italic">Preview Concept</span>
                          <h3 className="text-2xl font-black italic uppercase">{designType} Masterpiece</h3>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button 
                        onClick={() => setGeneratedDesign(null)}
                        className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all"
                       >
                         Discard
                       </button>
                       <button 
                        onClick={publishItem}
                        className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all"
                       >
                         Publish to Wardrobe
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center opacity-30 px-20">
                     <i className="fas fa-magic text-8xl mb-8 block"></i>
                     <h3 className="text-2xl font-black italic uppercase">Output Viewport</h3>
                     <p className="text-xs font-bold mt-2 uppercase tracking-widest">Enter a concept to see it manifest</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarView;
