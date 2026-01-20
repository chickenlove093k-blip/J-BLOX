
export enum ViewType {
  HOME = 'HOME',
  DISCOVER = 'DISCOVER',
  AVATAR = 'AVATAR',
  STUDIO = 'STUDIO',
  PROFILE = 'PROFILE',
  CATALOG = 'CATALOG',
  PLAY = 'PLAY',
  AI_HUB = 'AI_HUB'
}

export enum DeviceType {
  DESKTOP = 'Desktop',
  MOBILE = 'Mobile',
  VR = 'VR (Meta Quest)',
  XBOX = 'Xbox Edition',
  SWITCH = 'Switch Edition',
  PLAYSTATION = 'PlayStation Edition'
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatarUrl: string;
  jBucks: number; // Renamed from robux
  friendsCount: number;
  isLoggedIn: boolean;
}

export interface StudioObject {
  id: string;
  type: 'box' | 'sphere' | 'cylinder' | 'wedge' | 'character' | 'npc' | 'spawnlocation' | 'tree' | 'light' | 'decal';
  name: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  material: 'plastic' | 'neon' | 'metal' | 'wood' | 'glass' | 'grass' | 'fabric' | 'diamondplate';
  script?: string;
  data?: any;
}

export interface GameExperience {
  id: string;
  title: string;
  developer: string;
  thumbnail: string;
  rating: number;
  activePlayers: string;
  category: string;
  url: string;
  description?: string;
  worldData?: StudioObject[];
}

export interface CatalogItem {
  id: string;
  name: string;
  price: string;
  category: string;
  icon: string;
  isLimited: boolean;
  isLimitedU: boolean;
  serial?: string;
  link?: string;
}

// Added JRBLXProject interface for Studio export functionality
export interface JRBLXProject {
  projectName: string;
  version: string;
  instances: StudioObject[];
  globalScripts: string[];
}
