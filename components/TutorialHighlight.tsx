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
  advancesBy?: 'action' | 'next';
}

// A more robust overlay system using multiple divs to create a "hole"
// This prevents the overlay from intercepting clicks meant for the highlighted element.
const Overlay: React.FC<{ box: DOMRect; isVisible: boolean }> = ({ box, isVisible }) => {
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        transition: 'opacity 300ms ease-in-out',
        opacity: isVisible ? 1 : 0,
        pointerEvents: 'auto', // This blocks clicks on the rest of the screen
    };

    const top = { ...overlayStyle, top: 0, left: 0, width: '100%', height: `${box.top}px` };
    const bottom = { ...overlayStyle, top: `${box.bottom}px`, left: 0, width: '100%', height: `calc(100vh - ${box.bottom}px)` };
    const left = { ...overlayStyle, top: `${box.top}px`, left: 0, width: `${box.left}px`, height: `${box.height}px` };
    const right = { ...overlayStyle, top: `${box.top}px`, left: `${box.right}px`, width: `calc(100vw - ${box.right}px)`, height: `${box.height}px` };

    return (
        <>
            <div style={top} />
            <div style={bottom} />
            <div style={left} />
            <div style={right} />
        </>
    );
};

const Border: React.FC<{ box: DOMRect; isVisible: boolean }> = ({ box, isVisible }) => (
    <div
        className="fixed border-2 border-white rounded-xl transition-all duration-300 ease-in-out"
        style={{
            left: box.left - 4,
            top: box.top - 4,
            width: box.width + 8,
            height: box.height + 8,
            opacity: isVisible ? 1 : 0,
            pointerEvents: 'none', // The border itself should not be clickable
        }}
    />
);


const TutorialHighlight: React.FC<TutorialHighlightProps> = ({ targetId, title, text, step, totalSteps, onNext, onSkip, isVoiceOverEnabled, advancesBy = 'next' }) => {
  const [highlightBox, setHighlightBox] = useState<DOMRect | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const lastTargetId = useRef<string | null>(null);

  // --- Effect for voice-over ---
  useEffect(() => {
    if (isVoiceOverEnabled && isVisible) {
      const speechTimeout = setTimeout(() => {
        speechService.speak(`${title}. ${text}`);
      }, 400); // Delay for UI transition

      return () => {
        clearTimeout(speechTimeout);
        speechService.cancel();
      };
    } else {
      speechService.cancel();
    }
  }, [title, text, isVoiceOverEnabled, isVisible]);

  // --- Core Layout and Positioning Effect ---
  useLayoutEffect(() => {
    let animationFrameId: number;
    let observer: MutationObserver;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    
    const positionUI = (targetElement: HTMLElement) => {
        const newRect = targetElement.getBoundingClientRect();
        setHighlightBox(newRect);
        
        // Position Popover
        if (popoverRef.current) {
            const popoverHeight = popoverRef.current.offsetHeight;
            const popoverWidth = popoverRef.current.offsetWidth;
            const spacing = 15;

            let top = newRect.bottom + spacing;
            if (top + popoverHeight > window.innerHeight) {
                top = newRect.top - popoverHeight - spacing;
            }

            let left = newRect.left + newRect.width / 2;
            const minLeft = (popoverWidth / 2) + 8;
            const maxLeft = window.innerWidth - (popoverWidth / 2) - 8;
            left = Math.max(minLeft, Math.min(left, maxLeft));

            setPopoverStyle({
                top: `${top}px`,
                left: `${left}px`,
                transform: 'translateX(-50%)',
            });
        }
        setIsVisible(true);
    };

    const findAndSetTarget = () => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const isVerticallyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVerticallyVisible) {
          setIsVisible(false);
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          scrollTimeout = setTimeout(() => positionUI(targetElement), 500);
        } else {
          positionUI(targetElement);
        }
      } else {
        setIsVisible(false);
      }
    };

    if (targetId !== lastTargetId.current) {
        setIsVisible(false);
        lastTargetId.current = targetId;
    }

    const startObserving = () => {
        observer = new MutationObserver(() => {
            animationFrameId = requestAnimationFrame(findAndSetTarget);
        });
        findAndSetTarget();
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    };
    
    const initTimeout = setTimeout(startObserving, 50);
    
    const handleReposition = () => findAndSetTarget();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(scrollTimeout);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetId]);
    
  const finalPopoverStyle: React.CSSProperties = {
      ...popoverStyle,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? `${popoverStyle.transform} scale(1)` : `${popoverStyle.transform} scale(0.95)`,
  };

  const showNextButton = advancesBy === 'next';

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* New overlay system */}
      {highlightBox && (
        <>
            <Overlay box={highlightBox} isVisible={isVisible} />
            <Border box={highlightBox} isVisible={isVisible} />
        </>
       )}

      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed bg-[#FBF6E9] rounded-2xl p-4 shadow-xl max-w-sm w-[calc(100%-2rem)] border-4 border-double border-amber-800/70 pointer-events-auto transition-all duration-300 ease-in-out"
        style={finalPopoverStyle}
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
            {showNextButton && (
                 <button onClick={onNext} className="bg-amber-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-amber-600">
                    {step === totalSteps - 1 ? "Finish" : "Next"}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialHighlight;