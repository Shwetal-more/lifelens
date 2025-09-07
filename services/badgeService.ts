import { Badge, AchievementType } from '../types';

export const initialBadges: Badge[] = [
  { id: AchievementType.FIRST_WEEK_STREAK, name: 'First Week Streak', description: 'Maintain a 7-day streak.', unlocked: false, date: null },
  { id: AchievementType.MINDFUL_SPENDER, name: 'Mindful Spender', description: 'Log 5 expenses in a single day.', unlocked: false, date: null },
  { id: AchievementType.MOOD_MASTER, name: 'Mood Master', description: 'Log your mood for 7 consecutive days.', unlocked: false, date: null },
];
