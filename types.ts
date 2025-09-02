export enum Screen {
  Welcome = 'WELCOME',
  SignUpLogin = 'SIGNUP_LOGIN',
  Onboarding = 'ONBOARDING',
  Home = 'HOME',
  AddExpense = 'ADD_EXPENSE',
  MoodTracker = 'MOOD_TRACKER',
  Notes = 'NOTES',
  Insights = 'INSIGHTS',
  Profile = 'PROFILE',
  FutureMe = 'FUTURE_ME',
  Achievements = 'ACHIEVEMENTS',
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
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';
  phone?: string;
  smsEnabled?: boolean;
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