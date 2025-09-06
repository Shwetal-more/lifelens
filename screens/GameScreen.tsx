import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { GameState, BrixComponent, Quest, DecisionChoice, RiddleChallengeData, NotificationType } from "../types"
import { getPirateRiddle, getFinancialQuest, getWordHint } from "../services/geminiService"
import { speechService } from "../services/speechService"
import {
  SeaTile,
  GrasslandTile,
  ForestTile,
  SwampTile,
  MountainTile,
  TreasureMarkerTile,
  DeadlySeaTile,
  FogTile,
  LighthouseTile,
  ShipwreckTile,
} from "../components/MapTiles"
import { usePersistentState } from "../hooks/usePersistentState";
import TutorialHighlight from '../components/TutorialHighlight';


// --- ICONS ---
const DoubloonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-500">
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.453 3.35a.75.75 0 0 0 .256 1.178l4.285 2.082a.75.75 0 0 1 .387.65l-.945 4.55a.75.75 0 0 0 1.085.832l4.23-2.502a.75.75 0 0 1 .732 0l4.23 2.502a.75.75 0 0 0 1.085-.832l-.945-4.55a.75.75 0 0 1 .387-.65l4.285-2.082a.75.75 0 0 0 .256-1.178l-3.453-3.35-4.753-.39-1.83-4.401Z"
      clipRule="evenodd"
    />
  </svg>
)
const CargoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M3 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3Zm2 2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6Z" />
  </svg>
)
const ShopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.18 3a6.5 6.5 0 0 1 12.45 2.459V6.25a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5h2.383a5.002 5.002 0 0 0-9.66-1.21L4.63 3.75h1.5a.75.75 0 0 1 0 1.5h-1.5a3.25 3.25 0 0 0-3.234-2.85L1.75 2.5a.75.75 0 0 1-.75-.75ZM3.25 9A.75.75 0 0 1 4 8.25h12a.75.75 0 0 1 0 1.5H4A.75.75 0 0 1 3.25 9Zm0 3.5A.75.75 0 0 1 4 11.75h12a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.75-.75Zm0 3.5A.75.75 0 0 1 4 15.25h12a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.75-.75Z" />
  </svg>
)
const QuestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v.521c.413.042.813.122 1.2.239.387.116.766.273 1.133.475a.75.75 0 0 1 .484 1.066l-.16.32a.75.75 0 0 1-1.002.43l-1.313-.657a5.166 5.166 0 0 0-2.28 0l-1.313.657a.75.75 0 0 1-1.002-.43l-.16-.32a.75.75 0 0 1 .484-1.066c.367-.202.746-.36 1.133-.475.387-.117.787-.197 1.2-.24v-.52A.75.75 0 0 1 10 2ZM8.667 12.093l-.413-1.033a.75.75 0 0 0-1.434-.22l-1.29 2.58a.75.75 0 0 0 .534 1.047h.213a.75.75 0 0 0 .61-.341l.163-.324 1.033-.413a.75.75 0 0 0 .22-1.434ZM11.165 14.833a.75.75 0 0 0 .22-1.434l1.033-.413.163-.324a.75.75 0 0 0 .61-.341h.213a.75.75 0 0 0 .534-1.047l-1.29-2.58a.75.75 0 0 0-1.434-.22l-.413 1.033-3.666 1.467a.75.75 0 0 0-.413.916l1.29 2.58a.75.75 0 0 0 1.344.22l.413-1.033 1.467-3.666Z" clipRule="evenodd" />
    </svg>
)

const TreasureMapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.23,57.18c-3.52-1-5.4-4.59-4.39-8.11,1.1-3.83,5.13-5.91,8.65-4.91l16.29,4.68s10.6,3.05,15.93-3.92c5.33-6.97,3.93-15.93,3.93-15.93l-4.68-16.29c-1-3.52-4.59-5.4-8.11-4.39-3.83,1.1-5.91,5.13-4.91,8.65l4.68,16.29s3.05,10.6-3.92,15.93c-6.97,5.33-15.93,3.93-15.93,3.93l-16.29-4.68Z"
      fill="#FDEEBF"
      stroke="#A1887F"
      strokeWidth="2"
    />
    <path
      d="M21.5 40.5s3.5-6.5 11-6.5 10,5 10,5"
      stroke="#E57373"
      strokeWidth="2"
      strokeDasharray="4 4"
      strokeLinecap="round"
    />
    <path d="M42.5 39l-4 4m0-4l4 4" stroke="#D32F2F" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const SpeakerIcon = ({ enabled }: { enabled: boolean }) => (
    enabled ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 0 1 1.06 0c3.092 3.092 3.092 8.19 0 11.284a.75.75 0 0 1-1.06-1.06 6.75 6.75 0 0 0 0-9.164.75.75 0 0 1 0-1.06z" />
            <path d="M16.03 7.66a.75.75 0 0 1 1.06 0c1.562 1.562 1.562 4.094 0 5.656a.75.75 0 1 1-1.06-1.06 2.75 2.75 0 0 0 0-3.536.75.75 0 0 1 0-1.06z" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L19.5 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L19.5 10.94l-1.72-1.72z" />
        </svg>
    )
);

// --- GAME DATA ---
const brixCatalog: BrixComponent[] = [
  {
    id: "shelter_1",
    name: "Driftwood Hut",
    cost: 200,
    asset: "🛖",
    size: { width: 1, height: 1 },
    financialTip: "A simple shelter is like an emergency fund—it protects ye from unexpected storms!",
  },
  {
    id: "shelter_2",
    name: "Reinforced Shelter",
    cost: 800,
    asset: "🏡",
    size: { width: 1, height: 1 },
    financialTip:
      "Reinforcing yer shelter is like diversifying yer investments. A stronger foundation weathers any market!",
  },
  {
    id: "food_1",
    name: "Forager's Post",
    cost: 300,
    asset: "🍓",
    size: { width: 1, height: 1 },
    financialTip: "Foraging for food is like finding small ways to save. Every little bit adds up to a feast!",
  },
  {
    id: "food_2",
    name: "Fishing Weir",
    cost: 500,
    asset: "🎣",
    size: { width: 1, height: 1 },
    financialTip:
      "A fishing weir requires patience, just like long-term savings. The reward is a steady supply of sustenance.",
  },
  {
    id: "water_1",
    name: "Freshwater Still",
    cost: 400,
    asset: "💧",
    size: { width: 1, height: 1 },
    financialTip:
      "A clean water source is non-negotiable, just like paying off high-interest debt. Secure yer essentials first!",
  },
  {
    id: "utility_1",
    name: "Signal Tower",
    cost: 1500,
    asset: "🗼",
    size: { width: 1, height: 1 },
    financialTip:
      "A signal tower helps ye see far, like a good credit score. It opens up new opportunities on the horizon!",
  },
  {
    id: "campfire_1",
    name: "Signal Fire",
    cost: 250,
    asset: "🔥",
    size: { width: 1, height: 1 },
    financialTip: "A good budget is a signal fire, guiding yer spending and keeping ye from gettin' lost in the dark.",
  },
  {
    id: "treasure_chest",
    name: "Lost Treasure",
    cost: 99999,
    asset: "💎",
    size: { width: 1, height: 1 },
    financialTip: "Ye found the treasure! True wealth ain't just gold, but the wisdom ye gained on the journey.",
  },
]

const MAP_WIDTH = 20
const MAP_HEIGHT = 20

const mapLayout = [
  // 0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19  // X ->
  "WWWWWWWWWWWWWWWWWWWW", // 0 Y
  "WWWWWWFFFFFWWWWWWWWW", // 1
  "WWWWFFBBBBBFFWWWWWWW", // 2
  "WWWLFFBBBBBFFLWWWWWW", // 3
  "WWLFFEEEEBLLXMMMMWWWW", // 4
  "WLLLLFEEELLMMMMSSSWW", // 5
  "WLLLLFEEELLLLLSSSSXW", // 6
  "WLLLDDDFFLLLLLLLLSWW", // 7
  "WWLLDDDFFFLLLLLLLLLW", // 8
  "WWLLLDDDFFLLLLLLWWWW", // 9
  "WWWLLLLLLLLLLLLWWWWW", // 10
  "WWXLLLLLLLLLLLLLWWWW", // 11
  "WWLLPPLLLLLLLLLLWWWW", // 12
  "WIIIPPPLWWWWLLLGWWWW", // 13
  "WIIIIIPPPLWWLLLGGWWW", // 14
  "WWIIIILLLLLLLLGGGWWW", // 15
  "WWWIILLLLWWLLGGGWWWW", // 16
  "WWWWWWLLLWWLGGGWWWWW", // 17
  "WWWWWWLLWWLLNNWWWWWW", // 18
  "WWWWWHWWWWLNNNNXWWWW", // 19
]
  .join("")
  .split("")

const getQuestForLandmark = (char: string): Quest | null => {
  switch (char) {
    case "B": // Cursed Canopy
      return {
        id: "landmark_cursed_canopy",
        type: "hangman",
        title: "Cursed Canopy",
        description: "The ancient trees whisper words of power. Guess them to pass and claim a bounty!",
        reward: {
          doubloons: 0, 
          mapPieces: [ { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 }, { x: 6, y: 2 }, { x: 7, y: 2 } ],
        },
        data: {
          words: ["BUDGET", "SAVINGS", "ASSETS"],
          rewardCoins: 500,
        },
        isCompleted: false,
      };
    case "D": // Bog o' Bones
      return {
        id: "landmark_bog_o_bones",
        type: "riddle_challenge",
        title: "Bog o’ Bones",
        description: "Skeleton tax collectors demand their due! Answer their riddles to pass.",
        reward: {
          doubloons: 150,
          mapPieces: [{ x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }],
          items: ["Debt Slayer Talisman"],
        },
        data: {
          riddles: [
            { question: "I'm a hole in yer pocket, a weight on yer ship. The longer ye carry me, the further ye slip. What am I?", answer: "Debt", options: ["Anchor", "Debt", "Doubt"] },
            { question: "I have a mouth but never speak, I have a due date but I'm not a week. Pay me on time, and yer good name ye keep. What am I?", answer: "Bill", options: ["Bill", "Promise", "Tide"] },
            { question: "The more of me you pay down, the more of your own treasure is found. What am I?", answer: "Principal", options: ["Principal", "Interest", "Crew"] }
          ]
        },
        isCompleted: false,
      };
    case "I":
      return {
        id: "landmark_investing",
        type: "decision",
        title: "Valley of Myths",
        description: "Choose yer venture, captain.",
        reward: {
          doubloons: 150,
          mapPieces: [
            { x: 2, y: 15 },
            { x: 3, y: 15 },
          ],
        },
        data: {
          scenario:
            "A merchant offers two ventures: invest in his risky spice trade to an unknown land, or his reliable salt trade.",
          choices: [
            {
              text: "The risky spice trade!",
              isCorrect: false,
              feedback: "Yer ship was lost at sea! High risk can mean high loss. Diversify yer treasure!",
            },
            {
              text: "The reliable salt trade.",
              isCorrect: true,
              feedback: "A steady return! Reliable ventures build wealth over time.",
            },
          ],
        },
        isCompleted: false,
      }
    case "P":
      return {
        id: "landmark_patience",
        type: "riddle",
        title: "Lake o’ Lost Souls",
        description: "A ghostly figure offers a choice...",
        reward: {
          doubloons: 100,
          mapPieces: [
            { x: 6, y: 15 },
            { x: 7, y: 15 },
          ],
        },
        data: {
          question:
            "I am a pirate's greatest virtue, more valuable than gold. With me, small seeds of coin grow into treasures untold. What am I?",
          answer: "Patience",
          options: ["Strength", "Patience", "A Map"],
        },
        isCompleted: false,
      }
    default:
      return null
  }
}

// --- HELPER COMPONENTS ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#FBF6E9] rounded-2xl p-4 shadow-xl max-w-md w-full animate-fade-in border-8 border-double border-amber-800/70"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-900" style={{ fontFamily: "'IM Fell English SC', serif" }}>
            {title}
          </h2>
          <button onClick={onClose} className="font-bold text-2xl text-secondary">
            &times;
          </button>
        </div>
        {children}
      </div>
      <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
    </div>
  )
}

const HangmanFigure = ({ wrongGuesses }: { wrongGuesses: number }) => (
    <svg viewBox="0 0 100 120" className="w-32 h-40 mx-auto stroke-amber-900" strokeWidth="4" fill="none">
        {/* Gallows */}
        <line x1="10" y1="110" x2="90" y2="110" />
        <line x1="30" y1="110" x2="30" y2="10" />
        <line x1="28" y1="10" x2="70" y2="10" />
        <line x1="70" y1="10" x2="70" y2="25" />
        {/* Head */}
        {wrongGuesses > 0 && <circle cx="70" cy="35" r="10" strokeWidth="3" />}
        {/* Body */}
        {wrongGuesses > 1 && <line x1="70" y1="45" x2="70" y2="75" strokeWidth="3" />}
        {/* Left Arm */}
        {wrongGuesses > 2 && <line x1="70" y1="55" x2="55" y2="65" strokeWidth="3" />}
        {/* Right Arm */}
        {wrongGuesses > 3 && <line x1="70" y1="55" x2="85" y2="65" strokeWidth="3" />}
        {/* Left Leg */}
        {wrongGuesses > 4 && <line x1="70" y1="75" x2="55" y2="90" strokeWidth="3" />}
        {/* Right Leg */}
        {wrongGuesses > 5 && <line x1="70" y1="75" x2="85" y2="90" strokeWidth="3" />}
    </svg>
);


const getTerrainTile = (terrainChar: string) => {
  switch (terrainChar) {
    case "W":
      return <SeaTile />
    case "L":
      return <GrasslandTile />
    case "F":
      return <ForestTile />
    case "X":
      return <TreasureMarkerTile />
    case "H":
      return <ShipwreckTile />
    case "D":
      return <DeadlySeaTile />
    // Landmark tiles
    case "B":
      return <ForestTile /> // Budgeting
    case "E":
      return <ForestTile /> // Emergency
    case "I":
      return <MountainTile /> // Investing
    case "P":
      return <SwampTile /> // Patience
    case "G":
      return <LighthouseTile /> // Goals
    case "N":
      return <MountainTile /> // Inflation
    case "M":
      return <GrasslandTile /> // Means
    case "S":
      return <MountainTile /> // Saving (Waterfall)
    default:
      return <GrasslandTile />
  }
}

const getTerrainDescription = (char: string) => {
    switch (char) {
        case 'W': return 'Sea';
        case 'L': return 'Grassland';
        case 'F': return 'Forest';
        case 'X': return 'Treasure Marker';
        case 'H': return 'Shipwreck';
        case 'D': return 'Deadly Sea';
        case 'B': return 'Cursed Canopy';
        case 'E': return 'Emergency Grove';
        case 'I': return 'Valley of Myths';
        case 'P': return 'Lake of Lost Souls';
        case 'G': return 'Lighthouse Point';
        case 'N': return 'Inflationary Peaks';
        case 'M': return 'The Means Meadows';
        case 'S': return 'Savings Falls';
        default: return 'Land';
    }
};

const tutorialConfig = [
    { targetId: 'tutorial-doubloons', title: "Yer Doubloons", text: "Ahoy! This here is yer treasure chest. The more ye save in the real world, the more Doubloons ye'll have to spend on this island." },
    { targetId: 'tutorial-shop-button', title: "The Shop", text: "Let's get ye started. Head to the shop to see what ye can build. Go on, give it a click!" },
    { targetId: 'tutorial-shop-item', title: "Buy Yer First Piece", text: "Every settlement needs a start. I'll front ye the coin for a Driftwood Hut. Click it to 'buy' it for free!" },
    { targetId: 'tutorial-cargo-button', title: "Check Yer Cargo", text: "Excellent! Anything ye buy is stored in yer cargo hold. Open it up to see what ye've got." },
    { targetId: 'tutorial-cargo-item', title: "Select to Place", text: "There's yer new hut! Select it now to get ready to place it on the island." },
    { targetId: 'tutorial-place-cell', title: "Build Yer Legacy", text: "Find a nice clear spot like this one and click to place yer hut. This is the first step to building yer legacy!" },
    { targetId: 'tutorial-quest-button', title: "Seek Adventure!", text: "A fine start! To reveal more of the island and earn more Doubloons, ye'll need to complete quests. Find new ones right here!" },
];

// --- MAIN GAME SCREEN ---
interface GameScreenProps {
  brixCoins: number
  gameState: GameState
  onUpdateGameState: (newState: GameState | ((prevState: GameState) => GameState)) => void
  onPurchaseBrix: (brix: BrixComponent) => boolean
  onPlaceBrix: (brixId: string, x: number, y: number) => void
  onNavigateToChat: (context: "general" | "game") => void
  userName: string
  addNotification: (message: string, type: NotificationType) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  brixCoins,
  gameState,
  onUpdateGameState,
  onPurchaseBrix,
  onPlaceBrix,
  onNavigateToChat,
  userName,
  addNotification,
}) => {
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isQuestOpen, setIsQuestOpen] = useState(false)
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false)
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);
  const [placingBrixId, setPlacingBrixId] = useState<string | null>(null)
  const [questFeedback, setQuestFeedback] = useState<string | null>(null)
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false)
  const [usedRiddles, setUsedRiddles] = useState<string[]>([])
  const [usedScenarios, setUsedScenarios] = useState<string[]>([])
  const [cooldownTime, setCooldownTime] = useState('');
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: React.ReactNode;
    x: number;
    y: number;
  } | null>(null);

  // Timer State
  const [timer, setTimer] = useState<number | null>(null);
  const [timerPhase, setTimerPhase] = useState<'reading' | 'answering' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [hasSeenTutorial, setHasSeenTutorial] = usePersistentState('hasSeenGameTutorial.v2', false);
  const [tutorialState, setTutorialState] = useState({ isActive: !hasSeenTutorial, step: 0 });
  
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  const [dailyQuestData, setDailyQuestData] = usePersistentState<{ date: string; count: number } | null>('dailyQuestData', null);
  const DAILY_QUEST_LIMIT = 8;
  
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const HINT_COST = 25;

  const currentQuest = useMemo(() => gameState.quests.find((q) => !q.isCompleted), [gameState.quests])
  
  useEffect(() => {
    // Contextual tutorial step advancement
    if (tutorialState.isActive) {
        if (isShopOpen && tutorialState.step === 1) { // After "Click Shop" is shown
            setTutorialState(prev => ({ ...prev, step: 2 })); // Advance to "Highlight Item"
        }
        if (isInventoryOpen && tutorialState.step === 3) { // After "Click Cargo" is shown
            setTutorialState(prev => ({ ...prev, step: 4 })); // Advance to "Highlight Cargo Item"
        }
    }
  }, [isShopOpen, isInventoryOpen, tutorialState.isActive, tutorialState.step]);


  const handleTutorialNext = () => {
    const currentStep = tutorialState.step;
    const nextStep = currentStep + 1;

    // Special logic for specific steps
    if (currentStep === 1) { // After highlighting shop button, force it open
        setIsShopOpen(true);
        return; // The useEffect will handle advancing the step
    }
    if (currentStep === 2) { // After highlighting shop item
        // Give the user a free item to ensure they can proceed
        onUpdateGameState(gs => {
            const newInventory = [...gs.inventory];
            const existing = newInventory.find(i => i.brixId === 'shelter_1');
            if(existing) {
                existing.quantity += 1;
            } else {
                newInventory.push({ brixId: 'shelter_1', quantity: 1 });
            }
            return { ...gs, inventory: newInventory };
        });
        addNotification("I've added a Driftwood Hut to yer cargo to get ye started!", 'info');
        setIsShopOpen(false); // Close the shop for them
    }
    if (currentStep === 3) { // After highlighting cargo button, force it open
        setIsInventoryOpen(true);
        return;
    }
    if (currentStep === 4) { // After highlighting cargo item
        setPlacingBrixId('shelter_1');
        setIsInventoryOpen(false);
    }
     if (currentStep === 5) { // After highlighting place cell
        setPlacingBrixId(null); // Clear placing mode
    }


    if (nextStep >= tutorialConfig.length) {
        setTutorialState({ isActive: false, step: 0 });
        setHasSeenTutorial(true);
    } else {
        setTutorialState(prev => ({ ...prev, step: nextStep }));
    }
  };

  const handleTutorialSkip = () => {
    setTutorialState({ isActive: false, step: 0 });
    setHasSeenTutorial(true);
  };


  useEffect(() => {
    if (gameState.isVoiceOverEnabled) {
      if (isQuestOpen && currentQuest && !questFeedback && timerPhase === 'reading') {
        let speechText = `${currentQuest.title}. ${currentQuest.description}`;
        
        if (currentQuest.type === 'riddle' && currentQuest.data.question) {
            speechText += ` The riddle is: ${currentQuest.data.question}`;
        } else if (currentQuest.type === 'decision' && currentQuest.data.scenario) {
            speechText += ` ${currentQuest.data.scenario}`;
        } else if (currentQuest.type === 'riddle_challenge' && gameState.activeMinigameState && currentQuest.data.riddles) {
            const riddle = currentQuest.data.riddles[gameState.activeMinigameState.progress];
            if (riddle && riddle.question) {
                speechText += ` Riddle ${gameState.activeMinigameState.progress + 1}. ${riddle.question}`;
            }
        }

        speechService.speak(speechText);
      } else if (questFeedback) {
        speechService.speak(questFeedback);
      }
    }
    return () => speechService.cancel();
  }, [isQuestOpen, currentQuest, questFeedback, gameState.isVoiceOverEnabled, timerPhase, gameState.activeMinigameState]);
  
  useEffect(() => {
    return () => speechService.cancel();
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
    setTimer(null);
    setTimerPhase(null);
  }, []);

  useEffect(() => {
      if (isQuestOpen && currentQuest) {
          setTimerPhase('reading');
          setTimer(15);
      } else {
          stopTimer();
      }
  }, [isQuestOpen, currentQuest, stopTimer]);

  useEffect(() => {
      if (timer === null || timerPhase === null) return;

      if (timer > 0) {
          timerRef.current = setInterval(() => setTimer(t => (t !== null ? t - 1 : null)), 1000);
      } else { 
          if (timerPhase === 'reading') {
              setTimerPhase('answering');
              setTimer(15);
          } else { 
              stopTimer();
              setQuestFeedback("Time's up, matey! Try again later.");
              setTimeout(() => {
                  setIsQuestOpen(false);
                  setQuestFeedback(null);
              }, 2000);
          }
      }
      
      return () => {
          if (timerRef.current) {
              clearInterval(timerRef.current);
          }
      };
  }, [timer, timerPhase, stopTimer]);

  useEffect(() => {
    if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
    }

    const updateCooldown = () => {
        const now = Date.now();
        const endTime = gameState.questCooldownUntil || 0;
        const remaining = Math.max(0, endTime - now);
        
        if (remaining === 0) {
            setCooldownTime('');
            if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
            onUpdateGameState(gs => ({...gs}));
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setCooldownTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
    };

    const now = Date.now();
    if (gameState.questCooldownUntil && gameState.questCooldownUntil > now) {
        updateCooldown();
        cooldownIntervalRef.current = setInterval(updateCooldown, 1000);
    } else {
        setCooldownTime('');
    }

    return () => {
        if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
        }
    };
  }, [gameState.questCooldownUntil, onUpdateGameState]);

  const handleOpenQuest = (quest: Quest) => {
    if (!quest) return;
    setQuestFeedback(null);
    setHint(null);
    setIsQuestOpen(true);

    if (quest.type === 'hangman' && (!gameState.activeMinigameState || gameState.activeMinigameState.type !== 'hangman')) {
        onUpdateGameState(gs => ({...gs, activeMinigameState: { type: 'hangman', progress: 0, hangman: { guessedLetters: [], wrongGuesses: 0, hintUsed: false }}}));
    } else if (quest.type === 'riddle_challenge' && (!gameState.activeMinigameState || gameState.activeMinigameState.type !== 'riddle_challenge')) {
        onUpdateGameState(gs => ({...gs, activeMinigameState: { type: 'riddle_challenge', progress: 0 }}));
    }
  };


  const generateNextAIGeneratedQuest = useCallback(async () => {
    const today = new Date().toDateString();
    if (dailyQuestData && dailyQuestData.date === today && dailyQuestData.count >= DAILY_QUEST_LIMIT) {
        addNotification("Ye've had yer fill of adventure for one day, Captain! Come back tomorrow.", 'info');
        return;
    }

    setIsGeneratingQuest(true);
    const isRiddle = gameState.quests.length % 2 === 0;
    const nextQuestId = `q_ai_${gameState.quests.length + 1}`;
    let newQuestData: Partial<Quest> = { id: nextQuestId, isCompleted: false };

    try {
      if (isRiddle) {
        const riddleData = await getPirateRiddle(usedRiddles);
        setUsedRiddles((prev) => [...prev, riddleData.question]);
        newQuestData = {
          ...newQuestData,
          type: "riddle",
          title: riddleData.title,
          description: "A rolled-up parchment washes ashore with a mysterious question...",
          reward: { doubloons: 100, mapPieces: [] },
          data: {
            question: riddleData.question,
            options: riddleData.options,
            answer: riddleData.answer,
          },
        };
      } else {
        const financialData = await getFinancialQuest(usedScenarios);
        setUsedScenarios((prev) => [...prev, financialData.scenario || ""]);
        newQuestData = {
          ...newQuestData,
          type: "decision",
          title: financialData.title,
          description: "A situation arises that tests your financial wisdom, captain.",
          reward: { doubloons: 150, mapPieces: [] },
          data: {
            scenario: financialData.scenario,
            choices: financialData.choices,
          },
        };
      }
      onUpdateGameState((prevGameState) => ({
        ...prevGameState,
        quests: [...prevGameState.quests, newQuestData as Quest],
      }));
      setDailyQuestData(prev => {
        if (prev && prev.date === today) {
            return { ...prev, count: prev.count + 1 };
        }
        return { date: today, count: 1 };
      });
    } catch (error) {
      console.error("Failed to generate quest:", error);
    } finally {
      setIsGeneratingQuest(false);
    }
  }, [gameState.quests.length, onUpdateGameState, usedRiddles, usedScenarios, dailyQuestData, addNotification]);

 useEffect(() => {
    const discoveredLandmarkQuests = new Set(gameState.quests.map(q => q.id));
    let newQuests: Quest[] = [];

    gameState.revealedCells.forEach(cell => {
        const mapIndex = cell.y * MAP_WIDTH + cell.x;
        const landmarkChar = mapLayout[mapIndex];
        const landmarkQuest = getQuestForLandmark(landmarkChar);
        if (landmarkQuest && !discoveredLandmarkQuests.has(landmarkQuest.id)) {
            newQuests.push(landmarkQuest);
            discoveredLandmarkQuests.add(landmarkQuest.id);
        }
    });

    if (newQuests.length > 0) {
        onUpdateGameState(gs => ({...gs, quests: [...gs.quests, ...newQuests]}));
    }
}, [gameState.revealedCells, gameState.quests, onUpdateGameState]);



  const handleCellClick = (x: number, y: number) => {
    if (placingBrixId) {
      const mapIndex = y * MAP_WIDTH + x
      const terrain = mapLayout[mapIndex]
      const isLand = "LFMSEXHBDIPGN".includes(terrain)
      const isOccupied = gameState.placedBrix.some((b) => b.x === x && b.y === y)

      if (isLand && !isOccupied) {
        onPlaceBrix(placingBrixId, x, y)
        setPlacingBrixId(null)
        setIsInventoryOpen(false)
        if (tutorialState.isActive && tutorialState.step === 5) {
            handleTutorialNext();
        }
      }
    }
  }

  const inventoryWithData = useMemo(
    () =>
      gameState.inventory
        .map((item) => ({ ...item, ...brixCatalog.find((b) => b.id === item.brixId) }))
        .filter((item) => item.name),
    [gameState.inventory],
  )

  const completeQuest = useCallback(
    (quest: Quest) => {
      stopTimer();
      const QUEST_COOLDOWN = 3 * 60 * 1000;
      const QUEST_COOLDOWN_THRESHOLD = 5;
      const totalDoubloons = (quest.reward.doubloons || 0) + (quest.data.rewardCoins || 0);

      onUpdateGameState(prevGameState => {
          const updatedQuests = prevGameState.quests.map((q) => (q.id === quest.id ? { ...q, isCompleted: true } : q))

          const oldRevealedSet = new Set(prevGameState.revealedCells.map((c) => `${c.x},${c.y}`))
          const directRewardPieces = quest.reward.mapPieces.filter(p => !oldRevealedSet.has(`${p.x},${p.y}`));

          const frontier = new Set<string>();
          const allCurrentlyRevealed = [...prevGameState.revealedCells, ...directRewardPieces];

          allCurrentlyRevealed.forEach(cell => {
              const neighbors = [{x: cell.x - 1, y: cell.y}, {x: cell.x + 1, y: cell.y}, {x: cell.x, y: cell.y - 1}, {x: cell.x, y: cell.y + 1}];
              neighbors.forEach(n => {
                  if (n.x >= 0 && n.x < MAP_WIDTH && n.y >= 0 && n.y < MAP_HEIGHT) {
                      const mapIndex = n.y * MAP_WIDTH + n.x;
                      const terrain = mapLayout[mapIndex];
                      const isLand = "LFMSEXHBDIPGN".includes(terrain);
                      if (isLand && !oldRevealedSet.has(`${n.x},${n.y}`) && !directRewardPieces.some(p => p.x === n.x && p.y === n.y)) {
                          frontier.add(`${n.x},${n.y}`);
                      }
                  }
              });
          });
          
          const bonusReveals = Array.from(frontier).sort(() => 0.5 - Math.random()).slice(0, 2).map(s => {
              const [x, y] = s.split(',').map(Number);
              return { x, y };
          });
          
          const expandedRevealedCoords = [...directRewardPieces, ...bonusReveals];

          const combinedRevealed = [...prevGameState.revealedCells, ...expandedRevealedCoords]
          const uniqueRevealed = Array.from(new Set(combinedRevealed.map((c) => `${c.x},${c.y}`))).map((s) => {
            const [x, y] = s.split(",").map(Number)
            return { x, y }
          });
          
          setQuestFeedback(`Quest complete! +${totalDoubloons} Doubloons. ${expandedRevealedCoords.length} new areas revealed!`);
          
          setTimeout(() => {
            setIsQuestOpen(false)
            setQuestFeedback(null)
          }, 3000);

          const questsCompleted = (prevGameState.questsCompletedSinceCooldown || 0) + 1;
          let newCooldownUntil = prevGameState.questCooldownUntil;

          if (questsCompleted >= QUEST_COOLDOWN_THRESHOLD) {
              newCooldownUntil = Date.now() + QUEST_COOLDOWN;
          }

          return { 
              ...prevGameState, 
              quests: updatedQuests, 
              revealedCells: uniqueRevealed,
              spentBrixCoins: prevGameState.spentBrixCoins - totalDoubloons,
              specialItems: [...(prevGameState.specialItems || []), ...(quest.reward.items || [])],
              activeMinigameState: null,
              questCooldownUntil: newCooldownUntil,
              questsCompletedSinceCooldown: questsCompleted >= QUEST_COOLDOWN_THRESHOLD ? 0 : questsCompleted,
          };
      });
    },
    [onUpdateGameState, stopTimer],
  )
  
  const handleGetHint = async () => {
      if (!currentQuest || !gameState.activeMinigameState || gameState.activeMinigameState.type !== 'hangman' || brixCoins < HINT_COST) return;
      
      const { progress, hangman } = gameState.activeMinigameState;
      if (hangman?.hintUsed) return;

      setIsHintLoading(true);
      const word = currentQuest.data.words![progress];
      const hintText = await getWordHint(word);
      setHint(hintText);
      setIsHintLoading(false);

      onUpdateGameState(gs => ({
          ...gs,
          spentBrixCoins: gs.spentBrixCoins + HINT_COST,
          activeMinigameState: {
              ...gs.activeMinigameState!,
              hangman: {
                  ...gs.activeMinigameState!.hangman!,
                  hintUsed: true,
              }
          }
      }));
  }

  const handleQuestChoice = (choice: string | DecisionChoice) => {
    if (!currentQuest) return;
    stopTimer();

    if (currentQuest.type === "riddle") {
        if (choice === currentQuest.data.answer) {
            completeQuest(currentQuest);
        } else {
            setQuestFeedback("That ain't right, matey. Try again!");
        }
    } else if (currentQuest.type === "decision") {
        const decision = choice as DecisionChoice;
        setQuestFeedback(decision.feedback);
        if (decision.isCorrect) {
            completeQuest(currentQuest);
        } else {
            setTimeout(() => {
                setIsQuestOpen(false);
                setQuestFeedback(null);
            }, 3000);
        }
    } else if (currentQuest.type === 'riddle_challenge') {
        const minigame = gameState.activeMinigameState;
        if (!minigame) return;
        const riddle = (currentQuest.data as RiddleChallengeData).riddles[minigame.progress];
        if (choice === riddle.answer) {
            if (minigame.progress + 1 >= (currentQuest.data as RiddleChallengeData).riddles.length) {
                completeQuest(currentQuest);
            } else {
                setQuestFeedback("Correct! Here's the next one...");
                onUpdateGameState(gs => ({...gs, activeMinigameState: {...gs.activeMinigameState!, progress: gs.activeMinigameState!.progress + 1}}));
            }
        } else {
            setQuestFeedback("Wrong! The skeletons glare at ye menacingly.");
        }
    }
  }
  
  const handleHangmanGuess = (letter: string) => {
      if (!currentQuest || !gameState.activeMinigameState || gameState.activeMinigameState.type !== 'hangman') return;
      
      const { progress, hangman } = gameState.activeMinigameState;
      const word = currentQuest.data.words![progress];
      
      if (hangman!.guessedLetters.includes(letter)) return;

      const newGuessedLetters = [...hangman!.guessedLetters, letter];
      let newWrongGuesses = hangman!.wrongGuesses;
      
      if (!word.includes(letter)) {
          newWrongGuesses++;
      }
      
      const wordIsGuessed = word.split('').every(l => newGuessedLetters.includes(l));
      
      if (wordIsGuessed) {
          stopTimer();
          setQuestFeedback(`Correct! The word was ${word}!`);
          setTimeout(() => {
              const nextProgress = progress + 1;
              if (nextProgress >= currentQuest.data.words!.length) {
                  completeQuest(currentQuest);
              } else {
                  setQuestFeedback("On to the next word!");
                   setHint(null);
                  onUpdateGameState(gs => ({...gs, activeMinigameState: { type: 'hangman', progress: nextProgress, hangman: { guessedLetters: [], wrongGuesses: 0, hintUsed: false }}}));
                  setTimerPhase('reading');
                  setTimer(15);
              }
          }, 1500);
      } else if (newWrongGuesses >= 6) {
          stopTimer();
          setQuestFeedback(`Ye failed! The word was ${word}. That'll cost ye 50 Doubloons!`);
          onUpdateGameState(gs => ({...gs, spentBrixCoins: gs.spentBrixCoins + 50}));
          setTimeout(() => {
            setIsQuestOpen(false);
          }, 2500);
      } else {
           onUpdateGameState(gs => ({...gs, activeMinigameState: {...gs.activeMinigameState!, hangman: { guessedLetters: newGuessedLetters, wrongGuesses: newWrongGuesses }}}));
      }
  };

  const handleMouseEnterCell = (e: React.MouseEvent, x: number, y: number) => {
    const mapIndex = y * MAP_WIDTH + x;
    const terrain = mapLayout[mapIndex];
    const isRevealed = gameState.revealedCells.some(cell => cell.x === x && cell.y === y);
    const placed = gameState.placedBrix.find(b => b.x === x && b.y === y);
    const brixData = placed ? brixCatalog.find(b => b.id === placed.brixId) : null;
    const terrainDescription = getTerrainDescription(terrain);

    const content = (
      <div>
        <p className="font-bold text-primary">{terrainDescription}</p>
        <p className="text-sm text-secondary">{isRevealed ? 'Revealed' : 'Foggy'}</p>
        {brixData && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="font-semibold text-accent-dark">{brixData.name} {brixData.asset}</p>
            <p className="text-xs text-secondary italic">"{brixData.financialTip}"</p>
          </div>
        )}
      </div>
    );

    setTooltip({
      visible: true,
      content: content,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseLeaveCell = () => {
    setTooltip(null);
  };


  return (
    <div
      className="p-4 pt-6 h-full flex flex-col bg-[#FBF6E9]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* --- MODALS & TUTORIAL --- */}
      {tutorialState.isActive && (
        <TutorialHighlight
            targetId={tutorialConfig[tutorialState.step].targetId}
            title={tutorialConfig[tutorialState.step].title}
            text={tutorialConfig[tutorialState.step].text}
            step={tutorialState.step}
            totalSteps={tutorialConfig.length}
            onNext={handleTutorialNext}
            onSkip={handleTutorialSkip}
        />
      )}

      {tooltip && tooltip.visible && (
        <div
          className="fixed bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[60] pointer-events-none transition-opacity duration-200"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10, maxWidth: '200px' }}
        >
          {tooltip.content}
        </div>
      )}
      
      <Modal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} title="Brix & Pieces Shop">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {brixCatalog.map((brix) => (
            <div
              key={brix.id}
              id={brix.id === 'shelter_1' ? 'tutorial-shop-item' : undefined}
              onClick={() => onPurchaseBrix(brix)}
              className="bg-amber-100 p-3 rounded-xl text-center cursor-pointer hover:ring-2 ring-amber-500"
            >
              <p className="text-4xl">{brix.asset}</p>
              <p className="font-semibold text-sm mt-1">{brix.name}</p>
              <p className="text-xs text-amber-800 flex items-center justify-center gap-1">
                {brix.cost.toLocaleString()} <DoubloonIcon />
              </p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} title="Captain's Cargo">
        {inventoryWithData.length === 0 && (gameState.specialItems || []).length === 0 ? (
          <div className="text-center">
            <p className="text-secondary mb-4">Yer cargo hold is empty, Captain!</p>
            <p className="text-sm text-muted-foreground">Visit the shop to buy components for yer island!</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {placingBrixId
                ? "Click on cleared land to place yer component!"
                : "Select a component to place on yer island:"}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {inventoryWithData.map((item) => (
                <div
                  key={item.id}
                  id={item.id === 'shelter_1' ? 'tutorial-cargo-item' : undefined}
                  onClick={() => {
                    setPlacingBrixId(item.id!)
                    setIsInventoryOpen(false)
                  }}
                  className="bg-amber-100 p-3 rounded-xl text-center cursor-pointer hover:ring-2 ring-amber-500 transition-all"
                >
                  <p className="text-4xl">{item.asset}</p>
                  <p className="font-semibold text-sm mt-1">{item.name}</p>
                  <p className="text-xs text-secondary">Qty: {item.quantity}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.financialTip}</p>
                </div>
              ))}
            </div>
             {gameState.specialItems && gameState.specialItems.length > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-amber-200">
                    <h3 className="font-bold text-center text-primary">Special Items</h3>
                    <div className="flex justify-center gap-4 mt-2">
                        {gameState.specialItems.map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <span className="text-3xl">️️T</span>
                                <p className="text-xs font-semibold">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={isQuestOpen} onClose={() => setIsQuestOpen(false)} title={currentQuest?.title || "Quest"}>
        {currentQuest && (
          <div>
            {timer !== null && timerPhase && (
                <div className="text-center my-2 p-2 bg-amber-200/70 rounded-lg border border-amber-300">
                    <p className="font-bold text-xs uppercase text-amber-800">
                        {timerPhase === 'reading' ? 'Time to Ponder' : 'Time to Answer!'}
                    </p>
                    <p className="text-3xl font-bold text-primary">{timer}</p>
                </div>
            )}
            <p className="text-secondary mb-4 italic text-center">"{currentQuest.description}"</p>
            {questFeedback && ( <p className="my-4 text-center font-semibold text-accent-dark animate-fade-in">{questFeedback}</p> )}

            <div className={`${timerPhase === 'reading' ? 'opacity-50 pointer-events-none' : ''}`}>
              {currentQuest.type === 'riddle' && currentQuest.data.question && (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-center my-4">"{currentQuest.data.question}"</p>
                  {(currentQuest.data.options || []).map((option, index) => (
                    <button key={index} onClick={() => handleQuestChoice(option)} className="w-full bg-amber-100 text-primary font-semibold p-3 rounded-lg text-center hover:bg-amber-200">
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {currentQuest.type === 'decision' && currentQuest.data.scenario && (
                  <div className="space-y-2">
                      <p className="text-lg font-semibold text-center my-4">"{currentQuest.data.scenario}"</p>
                      {(currentQuest.data.choices || []).map((choice, index) => (
                          <button
                              key={index}
                              onClick={() => handleQuestChoice(choice)}
                              className="w-full bg-amber-100 text-primary font-semibold p-3 rounded-lg text-left hover:bg-amber-200"
                          >
                              {choice.text}
                          </button>
                      ))}
                  </div>
              )}
              
              {currentQuest.type === 'riddle_challenge' && gameState.activeMinigameState && (
                  <div className="space-y-2">
                      <p className="text-sm text-center font-bold">Riddle {gameState.activeMinigameState.progress + 1} of {currentQuest.data.riddles!.length}</p>
                      <p className="text-lg font-semibold text-center my-4">"{currentQuest.data.riddles![gameState.activeMinigameState.progress].question}"</p>
                      {(currentQuest.data.riddles![gameState.activeMinigameState.progress].options || []).map((option, index) => (
                          <button key={index} onClick={() => handleQuestChoice(option)} className="w-full bg-amber-100 text-primary font-semibold p-3 rounded-lg text-center hover:bg-amber-200">
                              {option}
                          </button>
                      ))}
                  </div>
              )}

              {currentQuest.type === 'hangman' && gameState.activeMinigameState?.hangman && (
                  <div className="text-center">
                      <HangmanFigure wrongGuesses={gameState.activeMinigameState.hangman.wrongGuesses} />
                      <p className="text-sm text-center font-bold text-amber-800 my-2">Word {gameState.activeMinigameState.progress + 1} of {currentQuest.data.words!.length}</p>
                       <div className="my-4 tracking-[0.5em] text-3xl font-bold text-center text-primary" style={{ fontFamily: "'IM Fell English SC', serif" }}>
                          {currentQuest.data.words![gameState.activeMinigameState.progress].split('').map((char, i) => (
                              <span key={i} className="inline-block w-8 border-b-4 border-amber-800">{gameState.activeMinigameState!.hangman!.guessedLetters.includes(char) ? char : '\u00A0'}</span>
                          ))}
                      </div>
                      
                      <div className="min-h-[4rem] flex items-center justify-center flex-col">
                        {hint && <p className="text-sm text-secondary italic mb-2 p-2 bg-amber-100 rounded-md">Hint: "{hint}"</p>}
                        
                        <button 
                            onClick={handleGetHint} 
                            disabled={isHintLoading || gameState.activeMinigameState.hangman.hintUsed || brixCoins < HINT_COST} 
                            className="text-sm bg-amber-200 text-amber-900 font-bold py-2 px-4 rounded-full mb-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                        >
                          💡 
                          {isHintLoading 
                            ? "Thinking..." 
                            : gameState.activeMinigameState.hangman.hintUsed 
                            ? "Hint Used" 
                            : `Get Hint (-${HINT_COST})`}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mt-2">
                          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                              <button key={letter} onClick={() => handleHangmanGuess(letter)} disabled={gameState.activeMinigameState!.hangman!.guessedLetters.includes(letter)}
                                  className="w-8 h-8 font-bold bg-amber-100 rounded disabled:bg-gray-300 disabled:text-gray-500 hover:bg-amber-200 transition-colors">
                                  {letter}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          </div>
        )}
      </Modal>

       <Modal isOpen={isQuestLogOpen} onClose={() => setIsQuestLogOpen(false)} title="Captain's Log">
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
            <div>
                <h3 className="font-bold text-amber-900 text-lg mb-2 sticky top-0 bg-[#FBF6E9] py-1">Active Quests</h3>
                {gameState.quests.filter(q => !q.isCompleted).length > 0 ? (
                    gameState.quests.filter(q => !q.isCompleted).map(q => (
                        <div key={q.id} className="mb-2 p-3 bg-amber-100 rounded-lg shadow-sm">
                            <p className="font-bold text-primary">{q.title}</p>
                            <p className="text-sm text-secondary italic">"{q.description}"</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-secondary p-3 bg-amber-50 rounded-lg">No active quests. Time to find a new adventure!</p>
                )}
            </div>
            <div>
                <h3 className="font-bold text-amber-900 text-lg mb-2 sticky top-0 bg-[#FBF6E9] py-1">Completed Quests</h3>
                {gameState.quests.filter(q => q.isCompleted).length > 0 ? (
                    gameState.quests.filter(q => q.isCompleted).map(q => (
                        <div key={q.id} className="mb-2 p-3 bg-green-100/70 rounded-lg opacity-80">
                            <p className="font-bold text-green-800 line-through">{q.title}</p>
                        </div>
                    ))
                ) : (
                     <p className="text-sm text-secondary p-3 bg-amber-50 rounded-lg">No quests completed yet.</p>
                )}
            </div>
        </div>
      </Modal>

      <Modal isOpen={isWorldMapOpen} onClose={() => setIsWorldMapOpen(false)} title="Treasure Map">
        <div className="bg-amber-100 p-1 rounded-lg shadow-inner border-2 border-amber-800/50">
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${MAP_WIDTH}, minmax(0, 1fr))` }}>
            {mapLayout.map((terrain, i) => {
              const x = i % MAP_WIDTH
              const y = Math.floor(i / MAP_WIDTH)
              const isRevealed = gameState.revealedCells.some((cell) => cell.x === x && cell.y === y)
              const isOcean = terrain === "W" || terrain === "D"
              return (
                <div key={i} className={`w-full aspect-square transition-opacity duration-500 relative`}>
                  {getTerrainTile(terrain)}
                  {!isRevealed && !isOcean && <FogTile />}
                </div>
              )
            })}
          </div>
        </div>
      </Modal>

      {/* --- HEADER & ACTIONS --- */}
      <header className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: "'IM Fell English SC', serif" }}>
            Pirate's Legacy
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onUpdateGameState(gs => ({ ...gs, isVoiceOverEnabled: !gs.isVoiceOverEnabled }))} className="p-2 rounded-full bg-card shadow-sm hover:bg-amber-100 text-primary">
                <SpeakerIcon enabled={gameState.isVoiceOverEnabled ?? true} />
            </button>
            <button onClick={() => setIsWorldMapOpen(true)} className="p-2 rounded-full bg-card shadow-sm hover:bg-amber-100">
                <TreasureMapIcon className="w-8 h-8" />
            </button>
        </div>
      </header>
      <p className="text-secondary -mt-4 mb-4">Captain {userName}'s Treasure Island</p>

      <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-card mb-4">
        <div className="flex justify-between items-center">
          <div id="tutorial-doubloons" className="font-bold text-xl text-amber-900 flex items-center gap-2 pl-2">
            <DoubloonIcon />
            <span>{brixCoins.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsQuestLogOpen(true)}
              className="bg-amber-800 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-2"
            >
              📜 Log
            </button>
            <button
              id="tutorial-cargo-button"
              onClick={() => setIsInventoryOpen(true)}
              className="bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl flex items-center gap-2"
            >
              <CargoIcon /> Cargo
            </button>
            <button
              id="tutorial-shop-button"
              onClick={() => setIsShopOpen(true)}
              className="bg-amber-400 text-amber-900 font-bold py-3 px-4 rounded-xl flex items-center gap-2"
            >
              <ShopIcon /> Shop
            </button>
          </div>
        </div>
      </div>
       
      {!currentQuest ? (
        <div className="mb-4">
          <button
            id="tutorial-quest-button"
            onClick={generateNextAIGeneratedQuest}
            disabled={isGeneratingQuest || !!cooldownTime || (dailyQuestData?.count ?? 0) >= DAILY_QUEST_LIMIT}
            className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingQuest
              ? 'Seeking adventure...'
              : cooldownTime
              ? `Next quest in ${cooldownTime}`
              : (dailyQuestData?.count ?? 0) >= DAILY_QUEST_LIMIT ? `Daily quest limit reached (${DAILY_QUEST_LIMIT}/${DAILY_QUEST_LIMIT})`
              : '📜 Find a Quest'}
          </button>
        </div>
      ) : (
        <div
          onClick={() => handleOpenQuest(currentQuest)}
          className={`bg-amber-100 border-2 border-amber-200 p-3 rounded-xl text-center mb-4 cursor-pointer hover:bg-amber-200`}
        >
          <p className="font-bold text-sm text-amber-900">
             New Quest Available: <span className="underline">{currentQuest.title}</span>
          </p>
        </div>
      )}


      {/* --- GAME MAP QUADRANT --- */}
      <div className="flex-grow flex items-center justify-center relative">
        <div 
          role="grid"
          aria-label="Captain's Island Map Quadrant"
          className="grid grid-cols-10 gap-0 bg-amber-200 rounded-lg shadow-inner aspect-square max-w-full max-h-full border-4 border-amber-800/80 overflow-hidden"
        >
          {Array.from({ length: 10 * 10 }).map((_, i) => {
            const viewX = i % 10
            const viewY = Math.floor(i / 10)
            const mapX = viewX
            const mapY = viewY + 10

            const mapIndex = mapY * MAP_WIDTH + mapX
            const terrain = mapLayout[mapIndex]
            const isRevealed = gameState.revealedCells.some((cell) => cell.x === mapX && cell.y === mapY)
            const placed = gameState.placedBrix.find((b) => b.x === mapX && b.y === mapY)
            const brixData = placed ? brixCatalog.find((b) => b.id === placed.brixId) : null
            const isLand = "LFMSEXHBDIPGN".includes(terrain)
            const isOcean = terrain === "W" || terrain === "D"
            const canPlace = isRevealed && isLand && !placed && placingBrixId

            const terrainDescription = getTerrainDescription(terrain);
            const revealedStatus = isRevealed ? 'Revealed' : 'Foggy';
            const contentStatus = brixData ? `, contains ${brixData.name}` : '';
            const cellDescription = `Cell at column ${mapX + 1}, row ${mapY + 1}. Type: ${terrainDescription}, Status: ${revealedStatus}${contentStatus}`;
            
            // Assign a specific ID for the tutorial to highlight
            const isTutorialCell = mapX === 2 && mapY === 10;
            const cellId = isTutorialCell ? 'tutorial-place-cell' : undefined;


            return (
              <div
                key={i}
                id={cellId}
                role="gridcell"
                aria-label={cellDescription}
                onClick={() => handleCellClick(mapX, mapY)}
                onMouseEnter={(e) => handleMouseEnterCell(e, mapX, mapY)}
                onMouseLeave={handleMouseLeaveCell}
                className={`w-full h-full relative transition-all ${
                  canPlace
                    ? "cursor-pointer hover:ring-2 ring-green-400 hover:bg-green-200/30 z-10"
                    : placingBrixId && isRevealed && isLand && placed
                      ? "ring-1 ring-red-400"
                      : ""
                }`}
              >
                {getTerrainTile(terrain)}
                {brixData && (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none drop-shadow-lg">
                    {brixData.asset}
                  </div>
                )}
                {!isRevealed && !isOcean && <FogTile />}
                {canPlace && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-6 h-6 bg-green-400/50 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {placingBrixId && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
            Placing Mode: Click on cleared land!
          </div>
        )}

        <button
          onClick={() => onNavigateToChat("game")}
          className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-3 shadow-lg transform hover:scale-110 transition-transform"
          aria-label="Ask the Genie"
        >
          <span className="text-2xl">🧞‍♂️</span>
        </button>
      </div>
    </div>
  )
}

export default GameScreen