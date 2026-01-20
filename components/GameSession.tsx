
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameExperience, StudioObject, DeviceType } from '../types';
import { remakeRobloxGame } from '../geminiService';
import { filterBadWords } from '../utils/safety';

interface GameSessionProps {
  game: GameExperience;
  onClose: () => void;
  device: DeviceType;
}

const createCharacterModel = (color: string) => {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), mat);
  head.position.y = 6.8;
  group.add(head);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(3, 3.5, 1.5), mat);
  torso.position.y = 4.2;
  group.add(torso);
  const limbGeo = new THREE.BoxGeometry(1.4, 3.5, 1.4);
  const lArm = new THREE.Mesh(limbGeo, mat);
  lArm.position.set(-2.2, 5.5, 0); lArm.geometry.translate(0, -1.75, 0);
  group.add(lArm);
  const rArm = new THREE.Mesh(limbGeo, mat);
  rArm.position.set(2.2, 5.5, 0); rArm.geometry.translate(0, -1.75, 0);
  group.add(rArm);
  const lLeg = new THREE.Mesh(limbGeo, mat);
  lLeg.position.set(-0.8, 3.5, 0); lLeg.geometry.translate(0, -1.75, 0);
  group.add(lLeg);
  const rLeg = new THREE.Mesh(limbGeo, mat);
  rLeg.position.set(0.8, 3.5, 0); rLeg.geometry.translate(0, -1.75, 0);
  group.add(rLeg);
  return group;
};

const ChatOverlay: React.FC<{ 
  onCommand: (cmd: string) => void;
  device: DeviceType;
  announcement: string | null;
}> = ({ onCommand, device, announcement }) => {
  const [messages, setMessages] = useState<{user: string, text: string, type?: string}[]>([]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const safeText = filterBadWords(input);
    setMessages(prev => [...prev.slice(-49), {user: 'Me', text: safeText}]);
    
    if (input.startsWith(':') || input.startsWith(';')) {
      onCommand(input.slice(1));
      setMessages(prev => [...prev.slice(-49), {user: 'System', text: `Command recognized: ${input}`, type: 'admin'}]);
    }
    setInput('');
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4">
      {announcement && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border-2 border-yellow-500/50 p-10 rounded-[3rem] text-center shadow-2xl z-[1000] animate-in zoom-in-95 duration-500 max-w-2xl pointer-events-auto">
          <h2 className="text-yellow-500 font-black italic uppercase text-3xl mb-4 tracking-tighter">HD ADMIN ANNOUNCEMENT</h2>
          <p className="text-2xl font-bold leading-tight">{announcement}</p>
        </div>
      )}

      <div className="absolute top-4 left-4 w-80 pointer-events-auto z-50">
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col h-72 overflow-hidden shadow-2xl">
          <div className="p-3 bg-white/5 text-[9px] font-black uppercase tracking-widest text-blue-400 flex justify-between items-center border-b border-white/5">
            <span>HD ADMIN V4 - ONLINE</span>
            <span className="text-[7px] text-gray-500">{device}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className="text-[11px] leading-relaxed">
                <span className={`font-black uppercase tracking-tighter ${m.type === 'admin' ? 'text-yellow-500' : m.user === 'Me' ? 'text-blue-500' : 'text-green-400'}`}>{m.user}: </span>
                <span className={m.type === 'admin' ? 'text-yellow-200 italic font-bold' : 'text-gray-100'}>{m.text}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-black/40 border-t border-white/5">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type :command (e.g., :fly, :speed 50)"
              className="w-full bg-transparent text-white text-[11px] focus:outline-none placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const GameSession: React.FC<GameSessionProps> = ({ game, onClose, device }) => {
  const [world, setWorld] = useState<StudioObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<THREE.Group>(null);
  const keys = useRef<{ [key: string]: boolean }>({});
  const velocity = useRef(new THREE.Vector3());
  const isJumping = useRef(false);
  const frameId = useRef<number>(0);
  const sceneRef = useRef<THREE.Scene>(null);

  const adminConfig = useRef({
    speed: 1.5, jumpPower: 2.0, isFlying: false, gravity: 0.1, isFrozen: false, btools: false
  });

  useEffect(() => {
    const load = async () => {
      const data = game.worldData || await remakeRobloxGame(game.title);
      setWorld(data);
      setLoading(false);
    };
    load();
  }, [game]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current[e.code] = true;
    const up = (e: KeyboardEvent) => keys.current[e.code] = false;
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    if (loading || !viewportRef.current) return;
    const scene = new THREE.Scene(); sceneRef.current = scene;
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.0004);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    viewportRef.current.appendChild(renderer.domElement);
    const player = createCharacterModel('#ffffff'); scene.add(player); playerRef.current = player;
    const light = new THREE.DirectionalLight(0xffffff, 2); light.position.set(200, 500, 100); light.castShadow = true; scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshStandardMaterial({ color: 0x4caf50 }));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
    
    world.forEach(obj => {
      let geo = new THREE.BoxGeometry(1, 1, 1);
      if (obj.type === 'sphere') geo = new THREE.SphereGeometry(1);
      else if (obj.type === 'cylinder') geo = new THREE.CylinderGeometry(1, 1, 2);
      else if (obj.type === 'character') geo = new THREE.BoxGeometry(2, 5, 2);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ 
        color: obj.color, 
        transparent: obj.material === 'glass',
        opacity: obj.material === 'glass' ? 0.5 : 1,
        emissive: obj.material === 'neon' ? obj.color : 0,
        emissiveIntensity: obj.material === 'neon' ? 1.5 : 0
      }));
      m.position.set(...obj.position); m.scale.set(...obj.scale); 
      if (obj.rotation) m.rotation.set(...obj.rotation);
      m.castShadow = true; m.receiveShadow = true; scene.add(m);
    });

    const loop = () => {
      if (playerRef.current && !adminConfig.current.isFrozen) {
        const p = playerRef.current;
        const s = adminConfig.current.speed;
        if (keys.current['KeyW']) p.translateZ(-s);
        if (keys.current['KeyS']) p.translateZ(s);
        if (keys.current['KeyA']) p.rotation.y += 0.05;
        if (keys.current['KeyD']) p.rotation.y -= 0.05;
        if (adminConfig.current.isFlying) {
          if (keys.current['Space']) p.position.y += s;
          if (keys.current['ShiftLeft']) p.position.y -= s;
          velocity.current.y = 0;
        } else {
          if (keys.current['Space'] && !isJumping.current) { velocity.current.y = adminConfig.current.jumpPower; isJumping.current = true; }
          p.position.y += velocity.current.y;
          if (p.position.y > 0) velocity.current.y -= adminConfig.current.gravity;
          else { p.position.y = 0; velocity.current.y = 0; isJumping.current = false; }
        }
        const camOffset = new THREE.Vector3(0, 20, 50).applyMatrix4(p.matrixWorld);
        camera.position.lerp(camOffset, 0.15); camera.lookAt(p.position.x, p.position.y+6, p.position.z);
      }
      renderer.render(scene, camera);
      frameId.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(frameId.current); renderer.dispose(); viewportRef.current?.removeChild(renderer.domElement); };
  }, [loading, world]);

  const handleAdmin = (fullCmd: string) => {
    const parts = fullCmd.toLowerCase().split(' ');
    const cmd = parts[0];
    const val = parts[1];
    const v = parseFloat(val);
    
    if (!playerRef.current) return;
    const p = playerRef.current;

    switch(cmd) {
      case 'speed': if (!isNaN(v)) adminConfig.current.speed = v/10; break;
      case 'jump':
      case 'jumppower': if (!isNaN(v)) adminConfig.current.jumpPower = v/10; break;
      case 'fly': adminConfig.current.isFlying = true; break;
      case 'unfly': adminConfig.current.isFlying = false; break;
      case 'invisible': p.visible = false; break;
      case 'visible': p.visible = true; break;
      case 'size': if (!isNaN(v)) p.scale.set(v,v,v); break;
      case 'tp': if (!isNaN(v)) p.position.set(0, 200, 0); break;
      case 'kill': p.position.set(0, 0, 0); break;
      case 'freeze': adminConfig.current.isFrozen = true; break;
      case 'unfreeze': adminConfig.current.isFrozen = false; break;
      case 'glow': 
        p.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material.emissive = new THREE.Color(0x00ffff);
            child.material.emissiveIntensity = 2;
          }
        });
        break;
      case 'unglow':
        p.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material.emissiveIntensity = 0;
          }
        });
        break;
      case 'announce':
        setAnnouncement(parts.slice(1).join(' ').toUpperCase());
        setTimeout(() => setAnnouncement(null), 5000);
        break;
      case 'jail':
        p.position.set(0, 10, 0);
        adminConfig.current.isFrozen = true;
        setAnnouncement("YOU HAVE BEEN JAILED BY ADMIN");
        setTimeout(() => setAnnouncement(null), 3000);
        break;
      case 'kick':
        onClose();
        break;
      case 'ban':
        onClose();
        alert("YOU HAVE BEEN PERMANENTLY BANNED FROM THIS MULTIVERSE INSTANCE.");
        break;
      case 'ff':
        setAnnouncement("FORCE FIELD ACTIVATED");
        setTimeout(() => setAnnouncement(null), 2000);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 bg-[#000]">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl rotate-45 animate-spin-slow"></div>
          <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase animate-pulse">RECONSTRUCTING WORLD...</h2>
        </div>
      ) : (
        <div className="h-full w-full relative" ref={viewportRef}>
          <ChatOverlay onCommand={handleAdmin} device={device} announcement={announcement} />
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-16 py-6 bg-black/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl text-center pointer-events-none">
             <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">{game.title}</h1>
             <p className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.3em] mt-2 animate-pulse">HD ADMIN PERMISSIONS: OWNER</p>
          </div>
          
          <button onClick={onClose} className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white font-black px-12 py-5 rounded-2xl shadow-xl z-50 transition-all active:scale-90 pointer-events-auto">LEAVE GAME</button>
          
          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 pointer-events-none text-[9px] text-gray-500 max-w-xs">
             <p className="text-yellow-500 font-black uppercase mb-3 tracking-widest text-[10px]">HD Admin v4 Owner Commands:</p>
             <div className="grid grid-cols-2 gap-x-8 gap-y-1 font-mono">
                <span>:speed [n]</span>
                <span>:jump [n]</span>
                <span>:fly / :unfly</span>
                <span>:glow / :unglow</span>
                <span>:invisible</span>
                <span>:freeze</span>
                <span>:announce [msg]</span>
                <span>:jail</span>
                <span>:kick / :ban</span>
                <span>:size [n]</span>
                <span>:kill</span>
                <span>:ff</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSession;
