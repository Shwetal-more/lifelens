import React, { useState, useEffect, useLayoutEffect } from 'react';

interface TutorialHighlightProps {
  targetId: string;
  title: string;
  text: string;
  step: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const TutorialHighlight: React.FC<TutorialHighlightProps> = ({ targetId, title, text, step, totalSteps, onNext, onSkip }) => {
  const [highlightBox, setHighlightBox] = useState<DOMRect | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightBox(rect);

      // Position popover below the element by default
      let top = rect.bottom + 15;
      let left = rect.left + rect.width / 2;

      // If it would go off-screen at the bottom, position it above
      if (top + 150 > window.innerHeight) { // 150 is an estimated popover height
        top = rect.top - 165;
      }
      
      // Adjust left position to keep it on screen
      const popoverWidth = 300; // Corresponds to max-w-sm
      if (left + (popoverWidth / 2) > window.innerWidth) {
        left = window.innerWidth - (popoverWidth / 2) - 16;
      }
      if (left - (popoverWidth / 2) < 0) {
        left = (popoverWidth / 2) + 16;
      }

      setPopoverPosition({ top, left });
    } else {
        // If element not found, maybe it's in a modal that isn't open.
        // Try again in a moment.
        const timeoutId = setTimeout(() => {
            const el = document.getElementById(targetId);
            if(el) setHighlightBox(el.getBoundingClientRect());
        }, 300);
        return () => clearTimeout(timeoutId);
    }
  }, [targetId]);

  if (!highlightBox) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Spotlight effect */}
      <div
        className="fixed transition-all duration-500 ease-in-out pointer-events-auto"
        style={{
          left: `${highlightBox.left - 4}px`,
          top: `${highlightBox.top - 4}px`,
          width: `${highlightBox.width + 8}px`,
          height: `${highlightBox.height + 8}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
        }}
        onClick={(e) => {
          // Allow click to pass through only for certain steps that require interaction
          if (step === 1 || step === 3) {
            e.stopPropagation(); // Prevent closing from parent clicks
          } else {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      ></div>

      {/* Popover */}
      <div
        className="fixed bg-[#FBF6E9] rounded-2xl p-4 shadow-xl max-w-sm w-full animate-fade-in border-4 border-double border-amber-800/70 pointer-events-auto"
        style={{
          top: `${popoverPosition.top}px`,
          left: `${popoverPosition.left}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="text-4xl">🧞‍♂️</div>
          <div>
            <h3 className="text-lg font-bold text-amber-900" style={{ fontFamily: "'IM Fell English SC', serif" }}>{title}</h3>
            <p className="text-secondary mt-1">{text}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button onClick={onSkip} className="text-xs text-secondary hover:underline">Skip Tutorial</button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-800">{step + 1} / {totalSteps}</span>
            <button onClick={onNext} className="bg-amber-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-amber-600">
              {step === totalSteps - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateX(-50%); } to { opacity: 1; transform: scale(1) translateX(-50%); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
       `}</style>
    </div>
  );
};

export default TutorialHighlight;