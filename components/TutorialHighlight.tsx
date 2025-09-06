import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { speechService } from '../services/speechService';

interface TutorialHighlightProps {
  targetId: string;
  title: string;
  text: string;
  step: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  isVoiceOverEnabled: boolean;
}

const TutorialHighlight: React.FC<TutorialHighlightProps> = ({ targetId, title, text, step, totalSteps, onNext, onSkip, isVoiceOverEnabled }) => {
  const [highlightBox, setHighlightBox] = useState<DOMRect | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Effect for voice-over
  useEffect(() => {
    if (isVoiceOverEnabled) {
      // Delay to allow user to read and for UI to settle
      const speechTimeout = setTimeout(() => {
        speechService.speak(`${title}. ${text}`);
      }, 500);

      return () => {
        clearTimeout(speechTimeout);
        speechService.cancel();
      };
    } else {
      speechService.cancel();
    }
  }, [title, text, isVoiceOverEnabled]);


  useLayoutEffect(() => {
    const calculatePosition = () => {
      const targetElement = document.getElementById(targetId);
      const popoverElement = popoverRef.current;

      if (targetElement && popoverElement) {
        const rect = targetElement.getBoundingClientRect();
        setHighlightBox(rect);
        
        const popoverHeight = popoverElement.offsetHeight;
        const popoverWidth = popoverElement.offsetWidth;
        const spacing = 15;

        // Vertical positioning
        let top = rect.bottom + spacing;
        if (top + popoverHeight > window.innerHeight) {
          top = rect.top - popoverHeight - spacing;
        }

        // Horizontal positioning (center aligned with transform)
        let left = rect.left + rect.width / 2;

        // Clamp left position to stay within viewport bounds
        const minLeft = (popoverWidth / 2) + 8;
        const maxLeft = window.innerWidth - (popoverWidth / 2) - 8;
        left = Math.max(minLeft, Math.min(left, maxLeft));

        setPopoverStyle({
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translateX(-50%)',
          opacity: 1,
        });
      } else {
         setHighlightBox(null);
      }
    };
    
    // Initial calculation might fail if target isn't rendered, so we try a few times.
    const tryCalculate = (retries = 3, delay = 100) => {
        calculatePosition();
        const targetElement = document.getElementById(targetId);
        if (!targetElement && retries > 0) {
            setTimeout(() => tryCalculate(retries - 1, delay), delay);
        }
    }
    
    tryCalculate();
    
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [targetId]);

  if (!highlightBox) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Spotlight effect */}
      <div
        className="fixed transition-all duration-300 ease-in-out pointer-events-auto"
        style={{
          left: `${highlightBox.left - 4}px`,
          top: `${highlightBox.top - 4}px`,
          width: `${highlightBox.width + 8}px`,
          height: `${highlightBox.height + 8}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
        }}
        onClick={(e) => {
            // Allow click-through on all interactive steps (all except the first one).
            if (step > 0) {
              e.stopPropagation();
            } else {
              // Block click-through on purely informational steps.
              e.preventDefault();
              e.stopPropagation();
            }
        }}
      ></div>

      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed bg-[#FBF6E9] rounded-2xl p-4 shadow-xl max-w-sm w-[calc(100%-2rem)] animate-fade-in border-4 border-double border-amber-800/70 pointer-events-auto transition-opacity duration-300"
        style={popoverStyle}
      >
        <div className="flex items-start gap-3">
          <div className="text-4xl flex-shrink-0">🧞‍♂️</div>
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