
import React from 'react';

// A collection of SVG components for rendering the game map tiles.

export const SeaTile = () => (
  <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="#4FC3F7" />
    <path d="M 0 3 C 2 4, 3 2, 5 3 S 7 4, 8 2, 10 3" stroke="#29B6F6" fill="none" strokeWidth="0.5" />
    <path d="M 0 6 C 1 5, 3 7, 5 6 S 7 5, 8 7, 10 6" stroke="#29B6F6" fill="none" strokeWidth="0.5" />
    <path d="M 0 9 C 2 10, 3 8, 5 9 S 7 10, 8 8, 10 9" stroke="#29B6F6" fill="none" strokeWidth="0.5" />
  </svg>
);

export const DeadlySeaTile = () => (
  <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="#00838F" />
    <path d="M 0 3 C 2 5, 3 1, 5 3 S 7 5, 8 1, 10 3" stroke="#006064" fill="none" strokeWidth="0.6" />
    <path d="M 0 6 C 1 4, 3 8, 5 6 S 7 4, 8 8, 10 6" stroke="#006064" fill="none" strokeWidth="0.6" />
    <path d="M 2 2 L 3 1 L 4 2" stroke="#B2EBF2" fill="none" strokeWidth="0.3" strokeLinecap="round"/>
    <path d="M 7 5 L 8 4 L 9 5" stroke="#B2EBF2" fill="none" strokeWidth="0.3" strokeLinecap="round"/>
  </svg>
);

export const BeachTile = () => (
    <rect width="10" height="10" fill="#FFF59D" />
);

export const GrasslandTile = () => (
    <rect width="10" height="10" fill="#81C784" />
);

export const ForestTile = () => (
    <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="10" fill="#558B2F" />
      <polygon points="5,1 2,7 8,7" fill="#33691E" />
      <rect x="4" y="6" width="2" height="3" fill="#4E342E" />
    </svg>
);

export const SwampTile = () => (
    <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
        <rect width="10" height="10" fill="#795548" />
        <rect y="5" width="10" height="5" fill="#8D6E63" />
        <circle cx="3" cy="4" r="0.5" fill="#4CAF50" opacity="0.7"/>
        <circle cx="7" cy="8" r="0.5" fill="#4CAF50" opacity="0.7"/>
    </svg>
);

export const MountainTile = () => (
    <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
        <rect width="10" height="10" fill="#B0BEC5" />
        <polygon points="5,2 1,9 9,9" fill="#78909C" />
        <polygon points="4,8 5,6 6,8" fill="#CFD8DC" />
    </svg>
);

export const MazeTile = () => (
    <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
        <rect width="10" height="10" fill="#A1887F" />
        <path d="M1 1 H5 V3 H3 V8 H8 V1" stroke="#795548" fill="none" strokeWidth="1" />
    </svg>
);


export const TreasureMarkerTile = () => (
  <div className="w-full h-full bg-yellow-200 flex items-center justify-center text-4xl">
    <span className="text-red-600 font-black">X</span>
  </div>
);

export const StartMarkerTile = () => (
  <div className="w-full h-full bg-yellow-200 flex items-center justify-center text-3xl">
    🚩
  </div>
);

export const LighthouseTile = () => (
  <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="#81C784" /> {/* Grass background */}
    <polygon points="4,9 6,9 6.5,2 3.5,2" fill="#E53935"/>
    <rect x="3.5" y="3" width="3" height="1.5" fill="white"/>
    <rect x="3.5" y="6" width="3" height="1.5" fill="white"/>
    <rect x="3" y="1" width="4" height="1" fill="#424242"/>
    <circle cx="5" cy="1" r="0.5" fill="#FFEB3B"/>
  </svg>
);

export const ShipwreckTile = () => (
  <svg width="100%" height="100%" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="#4FC3F7" /> {/* Sea background */}
    <path d="M 2 8 C 3 6, 5 6, 6 8 L 8 7 L 7 5 L 4 5 L 3 7 Z" fill="#A1887F" transform="rotate(-15 5 5)" />
    <path d="M 5 5 L 5 2 L 6 3 Z" fill="#795548" transform="rotate(-15 5 5)" />
  </svg>
);

export const FogTile = () => (
    <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm flex items-center justify-center text-white/30 text-lg pointer-events-none">
        ?
    </div>
);
