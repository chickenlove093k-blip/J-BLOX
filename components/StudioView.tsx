
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StudioObject, JRBLXProject, GameExperience } from '../types';
import { generateStudioScene } from '../geminiService';

interface StudioProps {
  onClose: () => void;
  onPlayTest: (game: GameExperience) => void;
}

const StudioView: React.FC<StudioProps> = ({ onClose, onPlayTest }) => {
  const [objects, setObjects] = useState<StudioObject[]>([
    { id: '1', type: 'box', name: 'Ocean', position: [0, -1, 0], scale: [200, 1, 200], color: '#1a4e66', material: 'glass' },
    { id: '2', type: 'box', name: 'IslandSand', position: [10, 0, 10], scale: [30, 2, 30], color: '#d2b48c', material: 'grass' },
    { id: '3', type: 'box', name: 'IslandGrass', position: [10, 1, 10], scale: [28, 1, 28], color: '#355e3b', material: 'grass' },
    { id: '4', type: 'character', name: 'Blox Fruit Dealer', position: [10, 4, 10], scale: [1, 1, 1], color: '#ffcc00', material: 'plastic' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<'viewport' | 'script'>('viewport');
  const [ribbonTab, setRibbonTab] = useState('Home');
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const controlsRef = useRef<OrbitControls>(null);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!viewportRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    const camera = new THREE.PerspectiveCamera(75, viewportRef.current.clientWidth / viewportRef.current.clientHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewportRef.current.clientWidth, viewportRef.current.clientHeight);
    viewportRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(100, 200, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    const grid = new THREE.GridHelper(1000, 100, 0x444444, 0x222222);
    scene.add(grid);

    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = scene;
    rendererRef.current = renderer;

    return () => {
      renderer.dispose();
      viewportRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    meshRefs.current.forEach(m => scene.remove(m));
    meshRefs.current.clear();

    objects.forEach(obj => {
      let geo;
      switch(obj.type) {
        case 'sphere': geo = new THREE.SphereGeometry(1); break;
        case 'cylinder': geo = new THREE.CylinderGeometry(1, 1, 2); break;
        case 'wedge': geo = new THREE.BoxGeometry(1, 1, 1); break;
        case 'character': geo = new THREE.BoxGeometry(2, 5, 2); break;
        default: geo = new THREE.BoxGeometry(1, 1, 1);
      }
      
      const mat = new THREE.MeshStandardMaterial({ 
        color: obj.color, 
        metalness: obj.material === 'metal' ? 0.9 : 0.1,
        roughness: 0.5,
        emissive: obj.material === 'neon' ? obj.color : 0,
        emissiveIntensity: obj.material === 'neon' ? 1.5 : 0,
        transparent: obj.material === 'glass',
        opacity: obj.material === 'glass' ? 0.5 : 1
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...obj.position);
      mesh.scale.set(...obj.scale);
      if (obj.rotation) mesh.rotation.set(...obj.rotation);
      scene.add(mesh);
      meshRefs.current.set(obj.id, mesh);
    });
  }, [objects]);

  const handleAiBuild = async () => {
    if (!prompt) return;
    setIsBuilding(true);
    try {
      const newScene = await generateStudioScene(prompt, objects);
      setObjects(newScene);
      setPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsBuilding(false);
    }
  };

  const spawnPart = (type: StudioObject['type'], color: string = '#888888') => {
    const newObj: StudioObject = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}_${objects.length + 1}`,
      position: [0, 5, 0],
      scale: [4, 4, 4],
      color,
      material: 'plastic'
    };
    setObjects([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setObjects(objects.filter(o => o.id !== selectedId));
      setSelectedId(null);
    }
  };

  const exportJRBLX = () => {
    const project: JRBLXProject = {
      projectName: "JesseProject_" + Date.now(),
      version: "1.0",
      instances: objects,
      globalScripts: []
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = project.projectName + '.jrblx';
    link.click();
  };

  const importJRBLX = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const project = JSON.parse(ev.target?.result as string) as JRBLXProject;
        if (project.instances) setObjects(project.instances);
      } catch (err) { alert("Invalid .JRBLX file"); }
    };
    reader.readAsText(file);
  };

  const handlePlayTest = () => {
    onPlayTest({
      id: 'studio-test',
      title: 'Studio Creative Session',
      developer: 'Me',
      thumbnail: '',
      rating: 100,
      activePlayers: '1',
      category: 'Testing',
      url: '',
      worldData: objects
    });
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#111] text-[11px] select-none font-sans overflow-hidden">
      <input type="file" ref={fileInputRef} className="hidden" accept=".jrblx" onChange={importJRBLX} />
      
      {/* Ribbon Header mimicking the screenshot */}
      <div className="h-32 bg-[#2d2d2d] border-b border-black flex flex-col shadow-2xl relative z-50">
        <div className="h-8 bg-[#1e1e1e] flex items-center px-4 gap-6 border-b border-black text-gray-400">
          <span className="font-bold flex items-center gap-1 cursor-pointer hover:text-white" onClick={onClose}>
            <i className="fas fa-file"></i> File
          </span>
          <div className="flex gap-4">
            {['Home', 'Model', 'Avatar', 'Test', 'View', 'Plugins'].map(t => (
              <span 
                key={t}
                onClick={() => setRibbonTab(t)}
                className={`cursor-pointer transition-all px-2 py-1 ${ribbonTab === t ? 'text-white border-b border-blue-500 bg-[#222]' : 'hover:text-white'}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex-1 flex items-center px-6 gap-6">
          <button onClick={onClose} className="flex flex-col items-center gap-1 hover:bg-white/5 p-2 rounded w-16 text-gray-400 hover:text-white">
            <i className="fas fa-arrow-left text-lg"></i>
            <span className="text-[9px] uppercase font-bold">Exit</span>
          </button>
          
          <div className="h-12 w-[1px] bg-white/10"></div>

          {ribbonTab === 'Home' && (
            <>
              <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <i className="fas fa-file-import text-blue-400 text-xl"></i>
                <span className="text-[9px] font-bold uppercase">Import</span>
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={exportJRBLX}>
                <i className="fas fa-download text-blue-500 text-xl"></i>
                <span className="text-[9px] font-bold uppercase">.JRBLX</span>
              </div>
              <button onClick={handlePlayTest} className="flex flex-col items-center gap-1 hover:bg-white/5 p-2 rounded text-blue-400 w-16">
                <i className="fas fa-play text-xl"></i>
                <span className="font-bold">PLAY</span>
              </button>
              <div className="flex-1 max-w-xl">
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiBuild()}
                  placeholder="Ask the AI Builder (e.g. 'Build a medieval tower with rotating lava blades')"
                  className="w-full bg-[#111] border border-black rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </>
          )}

          {ribbonTab === 'Model' && (
            <div className="flex gap-4">
              <button onClick={() => spawnPart('box')} className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded">
                <i className="fas fa-cube text-xl text-blue-400"></i>
                <span>Part</span>
              </button>
              <button onClick={() => spawnPart('sphere')} className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded">
                <i className="fas fa-circle text-xl text-yellow-400"></i>
                <span>Sphere</span>
              </button>
              <button onClick={() => spawnPart('wedge')} className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded">
                <i className="fas fa-caret-up text-xl text-purple-400"></i>
                <span>Wedge</span>
              </button>
            </div>
          )}

          {ribbonTab === 'Test' && (
            <button onClick={handlePlayTest} className="flex flex-col items-center gap-1 p-2 hover:bg-green-600/20 rounded text-green-400">
              <i className="fas fa-play-circle text-2xl"></i>
              <span className="font-bold">TEST GAME</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Explorer Panel */}
        <div className="w-80 bg-[#2d2d2d] border-r border-black flex flex-col">
          <div className="h-8 bg-[#1e1e1e] px-4 flex items-center justify-between border-b border-black">
            <span className="font-black text-[10px] uppercase tracking-tighter text-gray-500">Explorer</span>
            <div className="flex gap-3 text-gray-400">
              <i className="fas fa-plus hover:text-white cursor-pointer" onClick={() => spawnPart('box')}></i>
              <i className="fas fa-filter hover:text-white cursor-pointer"></i>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-[12px] text-gray-300">
            <div className="flex items-center gap-2 mb-1"><i className="fas fa-globe text-blue-400"></i> Workspace</div>
            {objects.map(obj => (
              <div 
                key={obj.id} 
                onClick={() => setSelectedId(obj.id)}
                className={`flex items-center gap-2 pl-6 py-1 cursor-pointer transition-colors ${selectedId === obj.id ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}
              >
                <i className={`fas ${obj.type === 'character' ? 'fa-user text-orange-400' : 'fa-cube text-blue-400'} text-[10px]`}></i>
                {obj.name}
              </div>
            ))}
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 relative bg-black flex flex-col">
          <div className="h-10 bg-[#1e1e1e] flex items-center px-4 gap-2 border-b border-black">
            <button 
              onClick={() => setActiveTab('viewport')}
              className={`px-6 h-full font-bold transition-all ${activeTab === 'viewport' ? 'bg-[#2d2d2d] text-blue-400 border-t-2 border-blue-500' : 'text-gray-500'}`}
            >
              Viewport
            </button>
            <button 
              onClick={() => setActiveTab('script')}
              className={`px-6 h-full font-bold transition-all ${activeTab === 'script' ? 'bg-[#2d2d2d] text-blue-400 border-t-2 border-blue-500' : 'text-gray-500'}`}
            >
              Script Editor
            </button>
          </div>

          <div className={`flex-1 relative ${activeTab === 'viewport' ? 'block' : 'hidden'}`} ref={viewportRef}>
            {isBuilding && (
              <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-black italic uppercase text-blue-400 tracking-widest">Building Quantum State...</h3>
              </div>
            )}
            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/5 text-[11px] pointer-events-none text-white/70 font-mono shadow-2xl">
              <p>Camera: Dynamic</p>
              <p>DeltaTime: 0.016s</p>
              <p>Physics: Active</p>
            </div>
          </div>

          <div className={`flex-1 bg-[#1e1e1e] p-10 font-mono overflow-auto ${activeTab === 'script' ? 'block' : 'hidden'}`}>
             <pre className="text-blue-400 leading-relaxed">
               {`local Workspace = game:GetService("Workspace")\nlocal Part = Instance.new("Part")\nPart.Name = "${objects.find(o => o.id === selectedId)?.name || 'NewPart'}"\nPart.Position = Vector3.new(0, 10, 0)\nPart.Parent = Workspace`}
             </pre>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-[#2d2d2d] border-l border-black flex flex-col">
          <div className="h-8 bg-[#1e1e1e] px-4 flex items-center justify-between border-b border-black">
            <span className="font-black text-[10px] uppercase tracking-tighter text-gray-500">Properties</span>
          </div>
          {selectedId ? (
            <div className="flex-1 overflow-y-auto divide-y divide-black/20">
              <PropRow label="Name" value={objects.find(o => o.id === selectedId)?.name || ''} />
              <PropRow label="BrickColor" value={objects.find(o => o.id === selectedId)?.color || ''} isColor />
              <PropRow label="Material" value={objects.find(o => o.id === selectedId)?.material || ''} />
              <PropRow label="Position" value={objects.find(o => o.id === selectedId)?.position.join(', ') || ''} />
              <PropRow label="Size" value={objects.find(o => o.id === selectedId)?.scale.join(', ') || ''} />
            </div>
          ) : (
            <div className="p-10 text-center text-gray-600 font-bold italic uppercase tracking-tighter">Select an object</div>
          )}
        </div>
      </div>
      
      <div className="h-8 bg-[#1e1e1e] border-t border-black flex items-center px-4 gap-8 text-[10px] text-gray-500 font-bold uppercase">
        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Ready</span>
        <span>Objects: {objects.length}</span>
        <span>FPS: 60.0</span>
      </div>
    </div>
  );
};

const PropRow = ({ label, value, isColor }: { label: string, value: string, isColor?: boolean }) => (
  <div className="flex items-center border-b border-black/5 hover:bg-white/5 h-8">
    <div className="w-1/3 px-4 text-gray-400 truncate">{label}</div>
    <div className="w-2/3 px-4 font-mono text-blue-300 flex items-center gap-2 overflow-hidden">
      {isColor && <div className="w-3 h-3 rounded-sm border border-black/50 shrink-0" style={{ background: value }}></div>}
      <span className="truncate">{value}</span>
    </div>
  </div>
);

export default StudioView;
