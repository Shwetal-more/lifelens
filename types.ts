export enum Screen {
  Welcome = 'welcome',
  SignUpLogin = 'signup_login',
  Onboarding = 'onboarding',
  Home = 'home',
  InnerCompass = 'inner_compass',
  Game = 'game',
  FinancialGoals = 'financial_goals',
  AddFinancialGoal = 'add_financial_goal',
  Profile = 'profile',
  AddExpense = 'add_expense',
  AddIncome = 'add_income',
  Notes = 'notes',
  SmsImport = 'sms_import',
  SpendingCheck = 'spending_check',
  Achievements = 'achievements',
  PrivacyPolicy = 'privacy_policy',
  AevumVault = 'aevum_vault',
  SetVaultWish = 'set_vault_wish',
  VaultRevealed = 'vault_revealed',
  Chat = 'chat',
}

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  age: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';
  smsEnabled: boolean;
}

export enum MoodType {
  Happy = 'Happy',
  Sad = 'Sad',
  Stressed = 'Stressed',
  Excited = 'Excited',
  Neutral = 'Neutral',
  Anxious = 'Anxious',
}

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: string;
  occasion: string;
  emotion: MoodType;
  isUseful: boolean;
}

export interface MoodEntry {
  id: string;
  date: Date;
  mood: MoodType;
  reason?: string;
}

export interface Income {
  id: string;
  date: Date;
  amount: number;
  source: string;
}

export interface Note {
    id: string;
    date: Date;
    content: string;
}

export interface FinancialGoal {
  id:string;
  name: string;
  icon: string;
  targetAmount: number;
  savedAmount: number;
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
  period: 'monthly' | 'yearly';
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  date: Date;
}

export enum AchievementType {
  FIRST_WEEK_STREAK = 'first_week_streak',
  MINDFUL_SPENDER = 'mindful_spender',
  MOOD_MASTER = 'mood_master',
}

export interface Badge {
  id: string | AchievementType;
  name: string;
  description: string;
  unlocked: boolean;
  date?: string | null;
}

// --- Game Types ---

export interface BrixComponent {
  id: string;
  name: string;
  cost: number;
  asset: string; // emoji or SVG string
  size: { width: number; height: number };
  financialTip: string;
}

export interface PlacedBrix {
  instanceId: string;
  brixId: string;
  x: number;
  y: number;
}

export interface DecisionChoice {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface RiddleChallengeData {
  riddles: { question: string; answer: string; options: string[] }[];
}

export interface Quest {
  id: string;
  type: "riddle" | "decision" | "hangman" | "riddle_challenge";
  title: string;
  description: string;
  reward: {
    doubloons?: number;
    mapPieces?: { x: number; y: number }[];
    items?: string[];
  };
  data: {
      question?: string;
      answer?: string;
      options?: string[];
      scenario?: string;
      choices?: DecisionChoice[];
      words?: string[];
      rewardCoins?: number;
      riddles?: { question: string; answer: string; options: string[] }[];
  };
  isCompleted: boolean;
}

export type ActiveMinigameState = {
    type: 'hangman';
    progress: number;
    hangman: {
        guessedLetters: string[];
        wrongGuesses: number;
        hintUsed?: boolean;
    };
} | {
    type: 'riddle_challenge';
    progress: number;
};

export interface GameState {
  spentBrixCoins: number;
  inventory: { brixId: string; quantity: number }[];
  placedBrix: PlacedBrix[];
  revealedCells: { x: number; y: number }[];
  clearedCells?: { x: number; y: number }[];
  quests: Quest[];
  activeMinigameState?: ActiveMinigameState | null;
  questCooldownUntil?: number;
  questsCompletedSinceCooldown?: number;
  isVoiceOverEnabled?: boolean;
  specialItems?: string[];
}
