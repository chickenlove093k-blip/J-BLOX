
import React, { useState, useRef } from 'react';
import { 
  askJesseBot, generateImageNano, generateVideoVeo, speakText, 
  analyzeImage 
} from '../geminiService';

const AiHubView: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{user: string, bot: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  const [imgPrompt, setImgPrompt] = useState('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<"1K" | "2K" | "4K">("1K");

  const [vidPrompt, setVidPrompt] = useState('');
  const [generatedVid, setGeneratedVid] = useState<string | null>(null);
  const [isGeneratingVid, setIsGeneratingVid] = useState(false);

  const [visionImg, setVisionImg] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  // Removed unused audioRef

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    setIsThinking(true);
    const msg = chatInput;
    setChatInput('');
    try {
      const reply = await askJesseBot(msg);
      setMessages(prev => [...prev, { user: msg, bot: reply }]);
      speakText(reply);
    } catch (e) { console.error(e); } finally { setIsThinking(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setVisionImg(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!visionImg || !chatInput) return;
    setIsAnalyzing(true);
    try {
      const base64 = visionImg.split(',')[1];
      const res = await analyzeImage(base64, chatInput);
      setVisionResult(res);
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase">JesseAI Quantum</h1>
          <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mt-2">Next-Gen Intelligence Portal</p>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Model: Gemini 3 Pro (32K Think)</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Advanced Chat Section */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col h-[700px] shadow-2xl">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3 italic">
            <i className="fas fa-brain text-blue-400"></i> Thinking Chat
          </h2>
          <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-600 p-5 rounded-3xl rounded-tr-none max-w-[80%] text-sm font-medium shadow-lg">
                    {m.user}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 p-6 rounded-3xl rounded-tl-none max-w-[85%] border border-white/5 text-sm leading-relaxed">
                    <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">JesseBot Reasoning</span>
                    {m.bot}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-3 text-blue-500 font-black italic animate-pulse">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Calculating complex response...
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={() => fileRef.current?.click()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-gray-400">
               <i className="fas fa-camera"></i>
            </button>
            <input 
              type="text" 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Type a complex prompt or ask about a photo..." 
              className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all"
            />
            <button onClick={handleChat} className="bg-blue-600 px-8 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20">
              SEND
            </button>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
        </section>

        {/* Media Generation & Analysis */}
        <div className="space-y-10">
          {/* Vision/Analysis */}
          {visionImg && (
            <section className="bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] p-8 animate-in zoom-in-95">
               <h3 className="font-black uppercase tracking-widest text-xs mb-4 text-blue-400">Image Understanding</h3>
               <div className="flex gap-6">
                 <img src={visionImg} className="w-32 h-32 object-cover rounded-2xl border border-white/10" />
                 <div className="flex-1 space-y-4">
                    <p className="text-xs text-gray-400 italic">"{visionResult || 'Upload and ask JesseBot above to analyze'}"</p>
                    <button onClick={handleAnalyze} className="w-full py-3 bg-blue-600 rounded-xl font-black text-xs hover:bg-blue-700 transition-all">ANALYZE WITH PRO</button>
                 </div>
               </div>
            </section>
          )}

          {/* Video Gen */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-xl">
            <h2 className="text-2xl font-black mb-8 italic uppercase flex items-center gap-3">
              <i className="fas fa-video text-red-500"></i> Veo 3 Video Gen
            </h2>
            <div className="space-y-6">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={vidPrompt} 
                  onChange={e => setVidPrompt(e.target.value)}
                  placeholder="Cinematic drone shot of..." 
                  className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 outline-none"
                />
                <button 
                  onClick={async () => {
                    setIsGeneratingVid(true);
                    const url = await generateVideoVeo(vidPrompt, visionImg?.split(',')[1]);
                    setGeneratedVid(url);
                    setIsGeneratingVid(false);
                  }} 
                  className="bg-red-600 px-8 rounded-2xl font-black hover:bg-red-700 shadow-xl shadow-red-600/20"
                >
                  {isGeneratingVid ? '...' : 'VEO'}
                </button>
              </div>
              {generatedVid && <video src={generatedVid} controls autoPlay className="w-full rounded-3xl shadow-2xl" />}
            </div>
          </section>

          {/* Nano Pro Image Gen */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-xl">
             <h2 className="text-2xl font-black mb-8 italic uppercase flex items-center gap-3">
              <i className="fas fa-image text-purple-500"></i> Nano Banana 3 (4K)
            </h2>
            <div className="flex gap-4 mb-6">
              {['1K', '2K', '4K'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setImgSize(s as any)}
                  className={`flex-1 py-2 rounded-xl font-black text-xs border transition-all ${imgSize === s ? 'bg-purple-600 border-purple-400' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
               <input 
                  type="text" 
                  value={imgPrompt} 
                  onChange={e => setImgPrompt(e.target.value)}
                  placeholder="A detailed futuristic avatar..." 
                  className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 outline-none"
                />
                <button onClick={async () => {
                   const url = await generateImageNano(imgPrompt, imgSize);
                   setGeneratedImg(url);
                }} className="bg-purple-600 px-8 rounded-2xl font-black">GEN</button>
            </div>
            {generatedImg && <img src={generatedImg} className="mt-8 w-full rounded-3xl border border-white/10 shadow-2xl animate-in fade-in" />}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AiHubView;
