// FIX: Removed self-import of `Screen` which was causing a conflict with its local declaration.
export enum Screen {
  Welcome = 'WELCOME',
  SignUpLogin = 'SIGNUP_LOGIN',
  Onboarding = 'ONBOARDING',
  Home = 'HOME',
  AddExpense = 'ADD_EXPENSE',
  AddIncome = 'ADD_INCOME',
  InnerCompass = 'INNER_COMPASS',
  Notes = 'NOTES',
  Profile = 'PROFILE',
  FinancialGoals = 'FINANCIAL_GOALS',
  AddFinancialGoal = 'ADD_FINANCIAL_GOAL',
  Achievements = 'ACHIEVEMENTS',
  AevumVault = 'AEVUM_VAULT',
  SetVaultWish = 'SET_VAULT_WISH',
  VaultRevealed = 'VAULT_REVEALED',
  Game = 'GAME',
  Chat = 'CHAT',
  SpendingCheck = 'SPENDING_CHECK',
  PrivacyPolicy = 'PRIVACY_POLICY',
}

export enum MoodType {
  Happy = 'Happy',
  Sad = 'Sad',
  Stressed = 'Stressed',
  Excited = 'Excited',
  Neutral = 'Neutral',
  Anxious = 'Anxious'
}

export enum AchievementType {
  FIRST_WEEK_STREAK = 'FIRST_WEEK_STREAK',
  MINDFUL_SPENDER = 'MINDFUL_SPENDER',
  MOOD_MASTER = 'MOOD_MASTER',
}

export interface Badge {
  id: AchievementType;
  name: string;
  description: string;
  unlocked: boolean;
  date?: string; 
}

export interface UserProfile {
  name: string;
  age: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';
  smsEnabled: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  occasion: string;
  emotion: MoodType;
  date: Date;
  isUseful: boolean;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: Date;
}

export interface MoodEntry {
  id: string;
  mood: MoodType;
  date: Date;
  reason?: string;
}

export interface Note {
  id: string;
  content: string;
  date: Date;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  icon: string;
  targetDate: string;
  isNorthStar?: boolean;
}

export interface AevumVault {
  goalId: string;
  message: string;
  riddle: string;
}

export interface SavingsTarget {
    amount: number;
    period: 'weekly' | 'monthly';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  date: Date;
}

// Types for Pirate's Legacy Game
export interface BrixComponent {
  id: string;
  name: string;
  cost: number;
  asset: string; // Emoji or identifier for visual
  size: { width: number; height: number }; // In grid units
  financialTip: string;
}

export interface PlacedBrix {
  instanceId: string; // Uniquely identifies each placed item
  brixId: string;
  x: number;
  y: number;
}

export interface UserBrix {
  brixId: string;
  quantity: number; // How many are in inventory, unplaced
}

interface RiddleData {
    question: string;
    options: string[];
    answer: string;
}

export interface HangmanData {
    words: string[];
    rewardCoins?: number;
}

export interface RiddleChallengeData {
    riddles: RiddleData[];
}

// FIX: Exported DecisionChoice interface so it can be imported in other files.
export interface DecisionChoice {
    text: string;
    isCorrect: boolean;
    feedback: string;
}

interface DecisionData {
    scenario: string;
    choices: DecisionChoice[];
}


export interface Quest {
    id: string;
    type: 'riddle' | 'decision' | 'hangman' | 'riddle_challenge';
    title: string;
    description: string;
    isCompleted: boolean;
    reward: {
        doubloons: number;
        mapPieces: {x: number, y: number}[];
        items?: string[];
    };
    data: Partial<RiddleData & DecisionData & HangmanData & RiddleChallengeData>;
}

export interface GameState {
  spentBrixCoins: number;
  inventory: UserBrix[];
  placedBrix: PlacedBrix[];
  revealedCells: {x: number, y: number}[];
  quests: Quest[];
  questCooldownUntil?: number;
  questsCompletedSinceCooldown?: number;
  isVoiceOverEnabled?: boolean;
  specialItems?: string[]; // To store talisman, etc.
  activeMinigameState?: { // To hold progress for multi-stage quests
      type: 'hangman' | 'riddle_challenge';
      progress: number; // e.g., wordIndex or riddleIndex
      hangman?: {
          guessedLetters: string[];
          wrongGuesses: number;
      }
  } | null;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}