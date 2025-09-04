
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { GameState, BrixComponent, Quest, DecisionChoice } from '../types';
import { getPirateRiddle, getFinancialQuest, getGameIntroStory } from '../services/geminiService';
import { SeaTile, BeachTile, GrasslandTile, ForestTile, SwampTile, MountainTile, TreasureMarkerTile, StartMarkerTile, DeadlySeaTile, MazeTile, FogTile, LighthouseTile, ShipwreckTile } from '../components/MapTiles';


// --- ICONS ---
const DoubloonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-500"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.453 3.35a.75.75 0 0 0 .256 1.178l4.285 2.082a.75.75 0 0 1 .387.65l-.945 4.55a.75.75 0 0 0 1.085.832l4.23-2.502a.75.75 0 0 1 .732 0l4.23 2.502a.75.75 0 0 0 1.085-.832l-.945-4.55a.75.75 0 0 1 .387-.65l4.285-2.082a.75.75 0 0 0 .256-1.178l-3.453-3.35-4.753-.39-1.83-4.401Z" clipRule="evenodd" /></svg>;
const CargoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3Zm2 2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6Z" /></svg>;
const ShopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.18 3a6.5 6.5 0 0 1 12.45 2.459V6.25a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5h2.383a5.002 5.002 0 0 0-9.66-1.21L4.63 3.75h1.5a.75.75 0 0 1 0 1.5h-1.5a3.25 3.25 0 0 0-3.234-2.85L1.75 2.5a.75.75 0 0 1-.75-.75ZM3.25 9A.75.75 0 0 1 4 8.25h12a.75.75 0 0 1 0 1.5H4A.75.75 0 0 1 3.25 9Zm0 3.5A.75.75 0 0 1 4 11.75h12a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.75-.75Zm0 3.5A.75.75 0 0 1 4 15.25h12a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.75-.75Z" /></svg>;
const TreasureMapIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.23,57.18c-3.52-1-5.4-4.59-4.39-8.11,1.1-3.83,5.13-5.91,8.65-4.91l16.29,4.68s10.6,3.05,15.93-3.92c5.33-6.97,3.93-15.93,3.93-15.93l-4.68-16.29c-1-3.52-4.59-5.4-8.11-4.39-3.83,1.1-5.91,5.13-4.91,8.65l4.68,16.29s3.05,10.6-3.92,15.93c-6.97,5.33-15.93,3.93-15.93,3.93l-16.29-4.68Z" fill="#FDEEBF" stroke="#A1887F" strokeWidth="2"/>
        <path d="M21.5 40.5s3.5-6.5 11-6.5 10,5 10,5" stroke="#E57373" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round"/>
        <path d="M42.5 39l-4 4m0-4l4 4" stroke="#D32F2F" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

// --- GAME DATA ---
const brixCatalog: BrixComponent[] = [
  { id: 'shelter_1', name: 'Driftwood Hut', cost: 200, asset: '🛖', size: { width: 1, height: 1 }, financialTip: "A simple shelter is like an emergency fund—it protects ye from unexpected storms!" },
  { id: 'shelter_2', name: 'Reinforced Shelter', cost: 800, asset: '🏡', size: { width: 1, height: 1 }, financialTip: "Reinforcing yer shelter is like diversifying yer investments. A stronger foundation weathers any market!" },
  { id: 'food_1', name: 'Forager\'s Post', cost: 300, asset: '🍓', size: { width: 1, height: 1 }, financialTip: "Foraging for food is like finding small ways to save. Every little bit adds up to a feast!" },
  { id: 'food_2', name: 'Fishing Weir', cost: 500, asset: '🎣', size: { width: 1, height: 1 }, financialTip: "A fishing weir requires patience, just like long-term savings. The reward is a steady supply of sustenance." },
  { id: 'water_1', name: 'Freshwater Still', cost: 400, asset: '💧', size: { width: 1, height: 1 }, financialTip: "A clean water source is non-negotiable, just like paying off high-interest debt. Secure yer essentials first!" },
  { id: 'utility_1', name: 'Signal Tower', cost: 1500, asset: '🗼', size: { width: 1, height: 1 }, financialTip: "A signal tower helps ye see far, like a good credit score. It opens up new opportunities on the horizon!" },
  { id: 'campfire_1', name: 'Signal Fire', cost: 250, asset: '🔥', size: { width: 1, height: 1 }, financialTip: "A good budget is a signal fire, guiding yer spending and keeping ye from gettin' lost in the dark." },
  { id: 'treasure_chest', name: 'Lost Treasure', cost: 99999, asset: '💎', size: { width: 1, height: 1 }, financialTip: "Ye found the treasure! True wealth ain't just gold, but the wisdom ye gained on the journey." },
];

const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;

const mapLayout = [
// 0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19  // X ->
  'WWWWWWWWWWWWWWWWWWWW', // 0 Y
  'WWWWWWFFFFFWWWWWWWWW', // 1
  'WWWWFFBBBBBFFWWWWWWW', // 2
  'WWWLFFBBBBBFFLWWWWWW', // 3
  'WWLFFEEEEBLLXMMMMWWWW', // 4
  'WLLLLFEEELLMMMMSSSWW', // 5
  'WLLLLFEEELLLLLSSSSXW', // 6
  'WLLLDDDFFLLLLLLLLSWW', // 7
  'WWLLDDDFFFLLLLLLLLLW', // 8
  'WWLLLDDDFFLLLLLLWWWW', // 9
  'WWWLLLLLLLLLLLLWWWWW', // 10
  'WWXLLLLLLLLLLLLLWWWW', // 11
  'WWLLPPLLLLLLLLLLWWWW', // 12
  'WIIIPPPLWWWWLLLGWWWW', // 13
  'WIIIIIPPPLWWLLLGGWWW', // 14
  'WWIIIILLLLLLLLGGGWWW', // 15
  'WWWIILLLLWWLLGGGWWWW', // 16
  'WWWWWWLLLWWLGGGWWWWW', // 17
  'WWWWWWLLWWLLNNWWWWWW', // 18
  'WWWWWHWWWWLNNNNXWWWW', // 19
].join('').split('');

const getQuestForLandmark = (char: string): Quest | null => {
    switch (char) {
        // Active quests in the playable quadrant
        case 'I': return { id: "landmark_investing", type: "decision", title: "Valley of Myths", description: "Choose yer venture, captain.", reward: { doubloons: 150, mapPieces: [{x:2,y:15}, {x:3,y:15}] }, data: { scenario: "A merchant offers two ventures: invest in his risky spice trade to an unknown land, or his reliable salt trade.", choices: [{ text: "The risky spice trade!", isCorrect: false, feedback: "Yer ship was lost at sea! High risk can mean high loss. Diversify yer treasure!" }, { text: "The reliable salt trade.", isCorrect: true, feedback: "A steady return! Reliable ventures build wealth over time." }] }, isCompleted: false };
        case 'P': return { id: "landmark_patience", type: "riddle", title: "Lake o’ Lost Souls", description: "A ghostly figure offers a choice...", reward: { doubloons: 100, mapPieces: [{x:6,y:15}, {x:7,y:15}] }, data: { question: "I am a pirate's greatest virtue, more valuable than gold. With me, small seeds of coin grow into treasures untold. What am I?", answer: "Patience", options: ["Strength", "Patience", "A Map"] }, isCompleted: false };
        
        // Other landmark quests are disabled for now
        case 'B': return { id: "landmark_budgeting", type: "decision", title: "Cursed Canopy", description: "A wise captain sorts their gold!", reward: { doubloons: 100, mapPieces: [{x:6,y:5}] }, data: { scenario: "Ye find 100 doubloons. A storm is brewin' (Needs), a fine new hat is for sale (Wants), and yer ship needs reinforcing (Savings).", choices: [{ text: "Spend it all on the hat!", isCorrect: false, feedback: "A fine hat, but a leaky ship! A captain must provide for needs first." }, { text: "Split it: 50 for repairs, 30 for the storm, 20 for the hat.", isCorrect: true, feedback: "Yarr, a wise choice! Ye've budgeted for all possibilities!" }] }, isCompleted: false };
        case 'D': return { id: "landmark_debt", type: "riddle", title: "Bog o’ Bones", description: "Escape the skeleton tax collectors!", reward: { doubloons: 150, mapPieces: [{x:12,y:3}] }, data: { question: "What grows the longer ye ignore it, and sinks yer ship if unpaid?", answer: "Debt", options: ["Barnacles", "Debt", "Regret"] }, isCompleted: false };
        case 'E': return { id: "landmark_emergency", type: "decision", title: "Ashenroot Forest", description: "A sudden squall! Prepare for the worst.", reward: { doubloons: 100, mapPieces: [{x:5,y:10}] }, data: { scenario: "Yer main sail rips in a gale! Luckily, ye had a spare stowed away from a previous port.", choices: [{ text: "Use the spare sail.", isCorrect: true, feedback: "Good thinkin'! That's yer emergency fund in action, savin' the day!" }, { text: "Try to patch the old one.", isCorrect: false, feedback: "A risky move! A proper emergency fund prevents desperate measures." }] }, isCompleted: false };
        case 'G': return { id: "landmark_goals", type: "riddle", title: "Skullflame Lighthouse", description: "A guiding light in the dark.", reward: { doubloons: 100, mapPieces: [{x:7,y:10}] }, data: { question: "I am a treasure ye cannot hold, a destination for the bold. I guide yer spendin' and yer savin', the grand prize ye be cravin'. What am I?", answer: "A Goal", options: ["A Star", "A Goal", "A Captain"] }, isCompleted: false };
        case 'S': return { id: "landmark_saving", type: "riddle", title: "Weeping Maiden’s Fall", description: "Every drop counts...", reward: { doubloons: 100, mapPieces: [{x:7,y:1}] }, data: { question: "I am a river flowin' slow, from many small doubloons I grow. A mighty ocean I can be, if ye keep on feedin' me. What am I?", answer: "Savings", options: ["A Creek", "Ambition", "Savings"] }, isCompleted: false };
        default: return null;
    }
};


// --- HELPER COMPONENTS ---
const Modal: React.FC<{isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string}> = ({isOpen, onClose, children, title}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-amber-50 rounded-2xl p-4 shadow-xl max-w-md w-full animate-fade-in border-4 border-amber-800/50" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-primary" style={{fontFamily: 'serif'}}>{title}</h2>
                    <button onClick={onClose} className="font-bold text-2xl text-secondary">&times;</button>
                </div>
                {children}
            </div>
            <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

const getTerrainTile = (terrainChar: string) => {
    switch(terrainChar) {
        case 'W': return <SeaTile />;
        case 'L': return <GrasslandTile />;
        case 'F': return <ForestTile />;
        case 'X': return <TreasureMarkerTile />;
        case 'H': return <ShipwreckTile />;
        case 'D': return <DeadlySeaTile />;
        // Landmark tiles
        case 'B': return <ForestTile />;   // Budgeting
        case 'E': return <ForestTile />;   // Emergency
        case 'I': return <MountainTile />; // Investing
        case 'P': return <SwampTile />;    // Patience
        case 'G': return <LighthouseTile />; // Goals
        case 'N': return <MountainTile />; // Inflation
        case 'M': return <GrasslandTile />;// Means
        case 'S': return <MountainTile />; // Saving (Waterfall)
        default: return <GrasslandTile />;
    }
};

// --- MAIN GAME SCREEN ---
interface GameScreenProps {
  brixCoins: number;
  gameState: GameState;
  onUpdateGameState: (newState: GameState) => void;
  onPurchaseBrix: (brix: BrixComponent) => boolean;
  onPlaceBrix: (brixId: string, x: number, y: number) => void;
  onNavigateToChat: (context: 'general' | 'game') => void;
  userName: string;
}

const GameScreen: React.FC<GameScreenProps> = ({ brixCoins, gameState, onUpdateGameState, onPurchaseBrix, onPlaceBrix, onNavigateToChat, userName }) => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isQuestOpen, setIsQuestOpen] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [placingBrixId, setPlacingBrixId] = useState<string | null>(null);
  const [questFeedback, setQuestFeedback] = useState<string | null>(null);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);

  // Intro State
  const [isIntroModalOpen, setIntroModalOpen] = useState(false);
  const [isIntroLoading, setIsIntroLoading] = useState(true);
  const [introStory, setIntroStory] = useState('');
  
  // Quest and Cooldown State
  const [questPhase, setQuestPhase] = useState<'thinking' | 'answering' | 'feedback' | null>(null);
  const [activeTimer, setActiveTimer] = useState(0); // For active quest modal
  const [cooldownTimer, setCooldownTimer] = useState(0); // For main screen display
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const currentQuest = useMemo(() => gameState.quests.find(q => !q.isCompleted), [gameState.quests]);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenGameIntro');
    if (!hasSeenIntro) {
      setIntroModalOpen(true);
      setIsIntroLoading(true);
      getGameIntroStory(userName).then(story => {
        setIntroStory(story);
        setIsIntroLoading(false);
      });
    }
  }, [userName]);

  const handleCloseIntro = () => {
    localStorage.setItem('hasSeenGameIntro', 'true');
    setIntroModalOpen(false);
  };

  // Effect to manage the global cooldown timer
  useEffect(() => {
    const calculateRemaining = () => {
      if (gameState.questCooldownUntil) {
        const remaining = Math.ceil((gameState.questCooldownUntil - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldownTimer(remaining);
        } else {
          setCooldownTimer(0);
          const newGameState = { ...gameState };
          delete newGameState.questCooldownUntil;
          onUpdateGameState(newGameState);
        }
      } else {
        setCooldownTimer(0);
      }
    };
    
    calculateRemaining(); // Initial check
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [gameState.questCooldownUntil, onUpdateGameState]);

  // Effect to manage the timer for the active quest modal
  useEffect(() => {
    if (activeTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setActiveTimer(prev => prev - 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      if (questPhase === 'thinking') {
        setQuestPhase('answering');
        setActiveTimer(10);
      } else if (questPhase === 'answering') {
        setQuestFeedback("Oops! Time's up, matey! The tides of fortune wait for no one.");
        onUpdateGameState({ ...gameState, questCooldownUntil: Date.now() + 60000 });
        setQuestPhase('feedback');
        setTimeout(() => {
            setIsQuestOpen(false);
            setQuestPhase(null);
            setQuestFeedback(null);
        }, 2000);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeTimer, questPhase, gameState, onUpdateGameState]);

  const openQuest = () => {
    if (cooldownTimer > 0) return;
    setQuestFeedback(null);
    setIsQuestOpen(true);
    setQuestPhase('thinking');
    setActiveTimer(20);
  };
  
  const handleCloseQuestModal = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setActiveTimer(0);
    setIsQuestOpen(false);
    setQuestPhase(null);
    setQuestFeedback(null);
  };

  const generateNextAIGeneratedQuest = useCallback(async (currentQuests: Quest[]) => {
      const nextQuestId = `q${currentQuests.length + 1}`;
      const isRiddle = currentQuests.length % 2 === 0; // Alternate between riddle and decision
      
      let newQuestData: Partial<Quest> = { id: nextQuestId, isCompleted: false };

      if (isRiddle) {
          const riddleData = await getPirateRiddle();
          newQuestData = { ...newQuestData, type: 'riddle', title: 'A Pirate\'s Riddle', description: "The wind whispers a question...", reward: { doubloons: 100, mapPieces: [{x:1,y:18}, {x:2,y:18}]}, data: riddleData };
      } else {
          const financialData = await getFinancialQuest();
          newQuestData = { ...newQuestData, type: 'decision', title: 'A Captain\'s Choice', description: "A true captain's worth is in their choices.", reward: { doubloons: 150, mapPieces: [{x:6,y:18}, {x:7,y:18}] }, data: financialData };
      }
      onUpdateGameState({ ...gameState, quests: [...currentQuests, newQuestData as Quest] });
      setIsGeneratingQuest(false);
  }, [gameState, onUpdateGameState]);

  useEffect(() => {
    const uncompletedQuests = gameState.quests.filter(q => !q.isCompleted);
    if (uncompletedQuests.length === 0 && !isGeneratingQuest) {
        setIsGeneratingQuest(true);
        generateNextAIGeneratedQuest(gameState.quests);
    }
  }, [gameState.quests, isGeneratingQuest, generateNextAIGeneratedQuest]);
  
  const handleCellClick = (x: number, y: number) => {
    if (placingBrixId) {
      onPlaceBrix(placingBrixId, x, y);
      setPlacingBrixId(null);
      setIsInventoryOpen(false);
    }
  };
  
  const inventoryWithData = useMemo(() => gameState.inventory.map(item => ({...item, ...brixCatalog.find(b => b.id === item.brixId)})).filter(item => item.name), [gameState.inventory]);

  const completeQuest = useCallback((quest: Quest) => {
    const updatedQuests = gameState.quests.map(q => q.id === quest.id ? { ...q, isCompleted: true } : q);

    const oldRevealedSet = new Set(gameState.revealedCells.map(c => `${c.x},${c.y}`));
    
    // Filter reward pieces to stay within the playable quadrant
    const newlyRevealedCoords = quest.reward.mapPieces
        .filter(p => !oldRevealedSet.has(`${p.x},${p.y}`))
        .filter(p => p.x >= 0 && p.x < 10 && p.y >= 10 && p.y < 20);

    const newLandmarkQuests: Quest[] = [];
    newlyRevealedCoords.forEach(coord => {
        const mapIndex = coord.y * MAP_WIDTH + coord.x;
        const landmarkChar = mapLayout[mapIndex];
        const landmarkQuest = getQuestForLandmark(landmarkChar);
        if (landmarkQuest && landmarkQuest.id.startsWith("landmark_") && !updatedQuests.some(q => q.id === landmarkQuest.id)) {
            newLandmarkQuests.push(landmarkQuest);
        }
    });

    const combinedRevealed = [...gameState.revealedCells, ...newlyRevealedCoords];
    const uniqueRevealed = Array.from(new Set(combinedRevealed.map(c => `${c.x},${c.y}`)))
        .map(s => { const [x, y] = s.split(',').map(Number); return { x, y }; });

    const allQuests = [...updatedQuests, ...newLandmarkQuests];
    
    onUpdateGameState({ ...gameState, quests: allQuests, revealedCells: uniqueRevealed });

    setTimeout(() => {
        setIsQuestOpen(false);
        setQuestFeedback(null);
        setQuestPhase(null);
    }, 2500);
  }, [gameState, onUpdateGameState]);

  const handleQuestChoice = (choice: string | DecisionChoice) => {
      if (!currentQuest || questPhase !== 'answering') return;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setQuestPhase('feedback');

      if (currentQuest.type === 'riddle') {
          if (choice === currentQuest.data.answer) {
              setQuestFeedback("Correct! The path forward reveals itself!");
              completeQuest(currentQuest);
          } else {
              setQuestFeedback("That ain't right, matey. Try again!");
          }
      } else if (currentQuest.type === 'decision') {
          const decision = choice as DecisionChoice;
          setQuestFeedback(decision.feedback);
          if (decision.isCorrect) {
            completeQuest(currentQuest);
          }
      }
  };

  const isCooldownActive = cooldownTimer > 0;

  return (
    <div className="p-4 pt-6 h-full flex flex-col bg-[#FBF6E9]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`}}>
      
      {/* --- MODALS --- */}
      <Modal isOpen={isIntroModalOpen} onClose={() => {}} title="A New Horizon!">
        <div className="p-2 text-center" style={{fontFamily: 'serif'}}>
            {isIntroLoading ? (
            <p className="animate-pulse">The Genie is charting the course...</p>
            ) : (
            <>
                <p className="text-secondary whitespace-pre-wrap">{introStory}</p>
                <button
                onClick={handleCloseIntro}
                className="mt-6 bg-amber-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-amber-600 transform hover:-translate-y-0.5 transition-all"
                >
                Let's Begin!
                </button>
            </>
            )}
        </div>
      </Modal>

      <Modal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} title="Brix & Pieces Shop">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {brixCatalog.map(brix => (
            <div key={brix.id} onClick={() => onPurchaseBrix(brix)} className="bg-amber-100 p-3 rounded-xl text-center cursor-pointer hover:ring-2 ring-amber-500">
              <p className="text-4xl">{brix.asset}</p>
              <p className="font-semibold text-sm mt-1">{brix.name}</p>
              <p className="text-xs text-amber-800 flex items-center justify-center gap-1">{brix.cost.toLocaleString()} <DoubloonIcon /></p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} title="Captain's Cargo">
        {inventoryWithData.length === 0 ? <p className="text-secondary">Yer cargo hold is empty, Captain!</p> : (
            <div className="grid grid-cols-3 gap-3">
                {inventoryWithData.map(item => (
                    <div key={item.id} onClick={() => { setPlacingBrixId(item.id!); setIsInventoryOpen(false); }} className="bg-amber-100 p-3 rounded-xl text-center cursor-pointer hover:ring-2 ring-amber-500">
                        <p className="text-4xl">{item.asset}</p>
                        <p className="font-semibold text-sm mt-1">{item.name}</p>
                        <p className="text-xs text-secondary">Qty: {item.quantity}</p>
                    </div>
                ))}
            </div>
         )}
      </Modal>

      <Modal isOpen={isQuestOpen} onClose={handleCloseQuestModal} title={currentQuest?.title || "Quest"}>
        {currentQuest && (
          <div>
            <p className="text-secondary mb-4 italic">"{currentQuest.description}"</p>
            
            {isGeneratingQuest && !currentQuest.data?.question && !currentQuest.data?.scenario ? (
              <p className="text-center animate-pulse">A new challenge is forming...</p>
            ) : (
              <>
                {(questPhase === 'thinking' || questPhase === 'answering' || questPhase === 'feedback') && (
                  <p className="text-lg font-semibold text-center my-4">"{currentQuest.data.question || currentQuest.data.scenario}"</p>
                )}

                {questPhase === 'thinking' && (
                  <div className="text-center my-8">
                    <p className="text-lg font-semibold text-primary">Think fast, Captain!</p>
                    <p className="text-4xl font-bold my-2">{activeTimer}</p>
                    <p className="text-sm text-secondary">Choices will appear soon.</p>
                  </div>
                )}

                {(questPhase === 'answering' || questPhase === 'feedback') && (
                  <div className="space-y-2 relative">
                    {questPhase === 'answering' && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(activeTimer / 10) * 100}%`, transition: 'width 1s linear' }}></div>
                        </div>
                    )}
                    {(currentQuest.type === 'riddle' ? (currentQuest.data.options || []) : (currentQuest.data.choices || [])).map((option, index) => (
                        <button 
                          key={index} 
                          onClick={() => handleQuestChoice(typeof option === 'string' ? option : option)}
                          disabled={questPhase !== 'answering'}
                          className="w-full bg-amber-100 text-primary font-semibold p-3 rounded-lg text-center hover:bg-amber-200 disabled:opacity-50"
                        >
                            {typeof option === 'string' ? option : option.text}
                        </button>
                    ))}
                  </div>
                )}

                {questFeedback && <p className="mt-4 text-center font-semibold text-accent-dark animate-fade-in">{questFeedback}</p>}
              </>
            )}
          </div>
        )}
      </Modal>
      
      <Modal isOpen={isWorldMapOpen} onClose={() => setIsWorldMapOpen(false)} title="Treasure Map">
        <div className="bg-amber-100 p-1 rounded-lg shadow-inner border-2 border-amber-800/50">
             <div className="grid gap-0" style={{gridTemplateColumns: `repeat(${MAP_WIDTH}, minmax(0, 1fr))`}}>
              {mapLayout.map((terrain, i) => {
                const x = i % MAP_WIDTH;
                const y = Math.floor(i / MAP_WIDTH);
                const isRevealed = gameState.revealedCells.some(cell => cell.x === x && cell.y === y);
                const isOcean = terrain === 'W' || terrain === 'D';
                return (
                  <div key={i} className={`w-full aspect-square transition-opacity duration-500 relative`}>
                    {getTerrainTile(terrain)}
                    {!isRevealed && !isOcean && <FogTile />}
                  </div>
                );
              })}
            </div>
        </div>
      </Modal>

      {/* --- HEADER & ACTIONS --- */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary" style={{fontFamily: "'Palatino', 'serif'"}}>Pirate's Legacy</h1>
        <button onClick={() => setIsWorldMapOpen(true)} className="p-2 rounded-full bg-card shadow-sm hover:bg-amber-100"><TreasureMapIcon className="w-8 h-8" /></button>
      </header>
      <p className="text-secondary -mt-4 mb-4">Captain {userName}'s Treasure Island</p>

      <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-card mb-4">
        <div className="flex justify-between items-center">
            <div className="font-bold text-xl text-amber-900 flex items-center gap-2 pl-2">
                <DoubloonIcon />
                <span>{brixCoins.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsInventoryOpen(true)} className="bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl flex items-center gap-2"><CargoIcon /> Cargo</button>
                <button onClick={() => setIsShopOpen(true)} className="bg-amber-400 text-amber-900 font-bold py-3 px-4 rounded-xl flex items-center gap-2"><ShopIcon /> Shop</button>
            </div>
        </div>
      </div>
       
      {currentQuest && (
          <div 
            onClick={isCooldownActive ? undefined : openQuest} 
            className={`bg-amber-100 border-2 border-amber-200 p-3 rounded-xl text-center mb-4 ${isCooldownActive ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-amber-200'}`}
          >
            <p className="font-bold text-sm text-amber-900">
                {isCooldownActive
                    ? `Quest on Cooldown: ${cooldownTimer}s left`
                    : <React.Fragment>New Quest: <span className="underline">{currentQuest.title}</span></React.Fragment>
                }
            </p>
          </div>
      )}

      {/* --- GAME MAP QUADRANT --- */}
      <div className="flex-grow flex items-center justify-center relative">
        <div className="grid grid-cols-10 gap-0 bg-amber-200 rounded-lg shadow-inner aspect-square max-w-full max-h-full border-4 border-amber-800/80 overflow-hidden">
          {Array.from({ length: 10 * 10 }).map((_, i) => {
            const viewX = i % 10;
            const viewY = Math.floor(i / 10);
            const mapX = viewX; // Bottom-left quadrant: x from 0-9
            const mapY = viewY + 10; // Bottom-left quadrant: y from 10-19
            
            const mapIndex = mapY * MAP_WIDTH + mapX;
            const terrain = mapLayout[mapIndex];
            const isRevealed = gameState.revealedCells.some(cell => cell.x === mapX && cell.y === mapY);
            const placed = gameState.placedBrix.find(b => b.x === mapX && b.y === mapY);
            const brixData = placed ? brixCatalog.find(b => b.id === placed.brixId) : null;
            const isLand = 'LFMSEXHBDIPGN'.includes(terrain);
            const isOcean = terrain === 'W' || terrain === 'D';
            
            return (
              <div key={i} onClick={() => isRevealed && isLand && handleCellClick(mapX, mapY)} 
                   className={`w-full h-full relative ${isRevealed && isLand && placingBrixId ? 'cursor-pointer hover:ring-2 ring-white z-10' : ''}`}>
                 {getTerrainTile(terrain)}
                 {brixData && <div className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none">{brixData.asset}</div>}
                 {!isRevealed && !isOcean && <FogTile />}
              </div>
            );
          })}
        </div>
        <button onClick={() => onNavigateToChat('game')} className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-3 shadow-lg transform hover:scale-110 transition-transform" aria-label="Ask the Genie">
          <span className="text-2xl">🧞‍♂️</span>
        </button>
      </div>
    </div>
  );
};

export default GameScreen;
