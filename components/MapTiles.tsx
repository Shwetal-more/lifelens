import React from 'react';

// A collection of SVG components for rendering the game map tiles.

export const SeaTile = () => (
  <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{stopColor:'#81D4FA', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#29B6F6', stopOpacity:1}} />
      </linearGradient>
    </defs>
    <rect width="10" height="10" fill="url(#seaGradient)" />
    <path d="M -1 3 C 2 1, 3 5, 5 3 S 7 1, 8 5, 11 3" stroke="white" fill="none" strokeWidth="0.3" opacity="0.3" />
    <path d="M -1 6 C 1 4, 4 8, 5 6 S 7 4, 9 8, 11 6" stroke="white" fill="none" strokeWidth="0.3" opacity="0.3" />
    <path d="M -1 9 C 2 7, 3 11, 5 9 S 7 7, 8 11, 11 9" stroke="white" fill="none" strokeWidth="0.3" opacity="0.3" />
  </svg>
);

export const DeadlySeaTile = () => (
  <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="deadlySeaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#006064', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#004D40', stopOpacity:1}} />
        </linearGradient>
    </defs>
    <rect width="10" height="10" fill="url(#deadlySeaGradient)" />
    <path d="M 0 3 C 2 5, 3 1, 5 3 S 7 5, 8 1, 10 3" stroke="#4DB6AC" fill="none" strokeWidth="0.4" opacity="0.5" />
    <path d="M 0 6 C 1 4, 3 8, 5 6 S 7 4, 8 8, 10 6" stroke="#4DB6AC" fill="none" strokeWidth="0.4" opacity="0.5" />
    <path d="M 2 2 L 3 1 L 4 2 M 7 5 L 8 4 L 9 5" stroke="#E0F2F1" fill="none" strokeWidth="0.3" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export const BeachTile = () => (
    <rect width="10" height="10" fill="#FFFDE7" />
);

export const GrasslandTile = () => (
    <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:'#A5D6A7', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#66BB6A', stopOpacity:1}} />
        </linearGradient>
      </defs>
      <rect width="10" height="10" fill="url(#grassGradient)" />
      <circle cx="2" cy="3" r="0.2" fill="#E8F5E9" opacity="0.7"/>
      <circle cx="8" cy="5" r="0.2" fill="#E8F5E9" opacity="0.7"/>
      <circle cx="5" cy="8" r="0.2" fill="#E8F5E9" opacity="0.7"/>
    </svg>
);

export const ForestTile = () => (
    <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="10" fill="#4CAF50" />
      <path d="M 2 9 L 2 7 L 1 7 L 3 4 L 5 7 L 4 7 L 4 9 Z" fill="#388E3C" />
      <path d="M 7 8 L 7 6 L 6 6 L 8 3 L 10 6 L 9 6 L 9 8 Z" fill="#2E7D32" />
    </svg>
);

export const SwampTile = () => (
    <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
        <rect width="10" height="10" fill="#8D6E63" />
        <path d="M -1 5 C 2 3, 4 7, 5 5 S 7 3, 9 7, 11 5" stroke="#6D4C41" fill="none" strokeWidth="0.8" opacity="0.5" />
        <path d="M 2 9 L 2 6 M 8 9 L 8 6" stroke="#558B2F" fill="none" strokeWidth="0.5" />
        <circle cx="2" cy="6" r="0.4" fill="#A1887F"/>
        <circle cx="8" cy="6" r="0.4" fill="#A1887F"/>
    </svg>
);

export const MountainTile = () => (
    <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
        <rect width="10" height="10" fill="#90A4AE" />
        <polygon points="1,9 5,2 9,9" fill="#607D8B" />
        <polygon points="3.5,5 5,2 6.5,5" fill="#CFD8DC" />
        <polygon points="0,9 3,6 7,9" fill="#78909C" />
    </svg>
);

export const TreasureMarkerTile = () => (
  <div className="w-full h-full bg-yellow-200 flex items-center justify-center text-4xl">
    <span className="text-red-600 font-black" style={{textShadow: '2px 2px 2px rgba(0,0,0,0.3)'}}>X</span>
  </div>
);

export const LighthouseTile = () => (
  <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="#A5D6A7" /> 
    <path d="M 0 10 L 0 8 C 2 7, 8 7, 10 8 L 10 10 Z" fill="#66BB6A" />
    <polygon points="4,8 6,8 6.5,2 3.5,2" fill="#F44336"/>
    <rect x="3.5" y="2.5" width="3" height="1.2" fill="white"/>
    <rect x="3.5" y="5" width="3" height="1.2" fill="white"/>
    <rect x="3" y="1" width="4" height="1" fill="#616161"/>
    <path d="M 5 1.5 L 8 0 L 8 3 Z" fill="#FFEB3B" opacity="0.7"/>
  </svg>
);

export const ShipwreckTile = () => (
  <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="#4FC3F7" />
    <path d="M -1 8 C 2 6, 3 10, 5 8 S 7 6, 9 10, 11 8" stroke="white" fill="none" strokeWidth="0.3" opacity="0.3" />
    <path d="M 2 8 C 3 6, 5 6, 6 8 L 8 7 L 7 5 L 4 5 L 3 7 Z" fill="#8D6E63" transform="rotate(-15 5 5)" />
    <path d="M 5 5 L 5 2 L 6 3 Z" fill="#6D4C41" transform="rotate(-15 5 5)" />
    <line x1="3" y1="7" x2="4" y2="6" stroke="#5D4037" strokeWidth="0.3" transform="rotate(-15 5 5)" />
    <line x1="4.5" y1="6.5" x2="5.5" y2="6" stroke="#5D4037" strokeWidth="0.3" transform="rotate(-15 5 5)" />
  </svg>
);

export const FogTile = () => (
    <div className="absolute inset-0 bg-gray-600/70 backdrop-blur-sm flex items-center justify-center text-white/50 text-xl font-serif pointer-events-none">
        ?
    </div>
);
