
import React from 'react';

interface WellnessPlantProps {
    growthScore: number;
}

const WellnessPlant: React.FC<WellnessPlantProps> = ({ growthScore }) => {
    let stage = 1;
    if (growthScore >= 5) stage = 2;
    if (growthScore >= 10) stage = 3;
    if (growthScore >= 15) stage = 4;

    return (
        <div className="w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Pot */}
                <path d="M25 90 H75 L80 70 H20 Z" fill="#D2691E" />
                <path d="M20 70 H80 V65 H20 Z" fill="#8B4513" />

                {/* Stage 1: Sprout */}
                {stage >= 1 && (
                     <path d="M50 70 C 55 60, 55 50, 50 40" stroke="#228B22" strokeWidth="4" fill="none" strokeLinecap="round" />
                )}
                
                {/* Stage 2: Small Leaves */}
                {stage >= 2 && (
                    <>
                     <path d="M50 55 C 40 50, 40 45, 48 42" stroke="#32CD32" strokeWidth="3" fill="none" strokeLinecap="round" />
                     <path d="M50 55 C 60 50, 60 45, 52 42" stroke="#32CD32" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </>
                )}

                {/* Stage 3: Bigger Plant */}
                 {stage >= 3 && (
                    <>
                      <path d="M50 70 C 40 50, 40 30, 50 20" stroke="#228B22" strokeWidth="5" fill="none" strokeLinecap="round" />
                      <path d="M50 45 C 35 40, 35 30, 48 25" stroke="#32CD32" strokeWidth="4" fill="none" strokeLinecap="round" />
                      <path d="M50 45 C 65 40, 65 30, 52 25" stroke="#32CD32" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </>
                )}

                {/* Stage 4: Flower */}
                {stage >= 4 && (
                    <g transform="translate(50, 18)">
                        <circle cx="0" cy="0" r="5" fill="#FFD700" />
                        {[0, 60, 120, 180, 240, 300].map(angle => (
                             <ellipse key={angle} cx="10" cy="0" rx="8" ry="4" fill="#FF69B4" transform={`rotate(${angle})`} />
                        ))}
                    </g>
                )}

            </svg>
        </div>
    );
};

export default WellnessPlant;
