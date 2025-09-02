import React, { useState, useCallback, useEffect } from 'react';
import { Screen, Expense, MoodEntry, Note, MoodType, Badge, AchievementType, UserProfile } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import SignUpLoginScreen from './screens/SignUpLoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import MoodTrackerScreen from './screens/MoodTrackerScreen';
import NotesScreen from './screens/NotesScreen';
import InsightsScreen from './screens/InsightsScreen';
import ProfileScreen from './screens/ProfileScreen';
import FutureMeScreen from './screens/FutureMeScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import BottomNav from './components/BottomNav';
import { getDailyChallenge } from './services/geminiService';

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const isYesterday = (d1: Date, d2: Date) => {
    const yesterday = new Date(d1);
    yesterday.setDate(d1.getDate() - 1);
    return isSameDay(yesterday, d2);
}

interface NotificationSettings {
    enabled: boolean;
    time: string; // HH:mm format
}

const initialAchievements: Badge[] = [
  { id: AchievementType.FIRST_WEEK_STREAK, name: 'First Week Streak', description: 'Maintain a 7-day streak.', unlocked: false },
  { id: AchievementType.MINDFUL_SPENDER, name: 'Mindful Spender', description: 'Log 5 expenses in a single day.', unlocked: false },
  { id: AchievementType.MOOD_MASTER, name: 'Mood Master', description: 'Log your mood for 7 consecutive days.', unlocked: false },
];


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Welcome);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', amount: 75.50, category: 'Food', occasion: 'Dinner with friends', emotion: MoodType.Happy, date: new Date(Date.now() - 86400000 * 2) },
    { id: '2', amount: 120.00, category: 'Shopping', occasion: 'New shoes', emotion: MoodType.Stressed, date: new Date(Date.now() - 86400000 * 1) },
    { id: '3', amount: 15.00, category: 'Transport', occasion: 'Commute', emotion: MoodType.Neutral, date: new Date() },
  ]);

  const [moods, setMoods] = useState<MoodEntry[]>([
      { id: '1', mood: MoodType.Happy, date: new Date(Date.now() - 86400000 * 2), reason: 'A lovely day out.' },
      { id: '2', mood: MoodType.Stressed, date: new Date(Date.now() - 86400000 * 1), reason: 'Work deadline pressure.' },
      { id: '3', mood: MoodType.Excited, date: new Date(), reason: 'Weekend plans!' },
  ]);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [futureMessages, setFutureMessages] = useState<Note[]>([]);

  // Editing state
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Gamification State
  const [streak, setStreak] = useState(1);
  const [lastLogDate, setLastLogDate] = useState<Date | null>(new Date());
  const [challenge, setChallenge] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState<Badge[]>(initialAchievements);
  
  // Notification State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ enabled: false, time: '19:00' });
  
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    setIsInitialized(true);

    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) setNotificationSettings(JSON.parse(savedSettings));

    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
        const parsedAchievements = JSON.parse(savedAchievements);
        setAchievements(parsedAchievements);
    }

    const fetchChallenge = async () => {
        const newChallenge = await getDailyChallenge();
        setChallenge(newChallenge);
    }
    fetchChallenge();
  }, []);

  useEffect(() => {
    const checkAchievements = () => {
        let updated = false;
        const newAchievements: Badge[] = JSON.parse(JSON.stringify(achievements)); // Deep copy

        const unlockBadge = (badgeId: AchievementType) => {
            const badge = newAchievements.find(a => a.id === badgeId);
            if (badge && !badge.unlocked) {
                badge.unlocked = true;
                badge.date = new Date().toLocaleDateString();
                updated = true;
                return true;
            }
            return false;
        };

        if (streak >= 7) unlockBadge(AchievementType.FIRST_WEEK_STREAK);

        const todayExpensesCount = expenses.filter(e => isSameDay(new Date(), e.date)).length;
        if (todayExpensesCount >= 5) unlockBadge(AchievementType.MINDFUL_SPENDER);
        
        const uniqueMoodDays = [...new Set(moods.map(m => m.date.toDateString()))].map(d => new Date(d));
        if (uniqueMoodDays.length >= 7) {
            let consecutiveDays = 0;
            let checkDate = new Date();
            for (let i = 0; i < 7; i++) {
                if (uniqueMoodDays.some(moodDate => isSameDay(checkDate, moodDate))) {
                    consecutiveDays++;
                } else {
                    break;
                }
                checkDate.setDate(checkDate.getDate() - 1);
            }
            if (consecutiveDays >= 7) unlockBadge(AchievementType.MOOD_MASTER);
        }

        if (updated) {
            setAchievements(newAchievements);
            localStorage.setItem('achievements', JSON.stringify(newAchievements));
        }
    };
    checkAchievements();
  }, [expenses, moods, streak, achievements]);


  useEffect(() => {
    if (notificationSettings.enabled) {
        const checkTime = setInterval(() => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            if (currentTime === notificationSettings.time) {
                alert("LifeLens Reminder: Time to log your mood and expenses!");
            }
        }, 60000); // Check every minute
        return () => clearInterval(checkTime);
    }
  }, [notificationSettings]);

  const updateNotificationSettings = (settings: NotificationSettings) => {
      setNotificationSettings(settings);
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }
  
  const handleLogActivity = useCallback(() => {
    const today = new Date();
    if (!lastLogDate || !isSameDay(today, lastLogDate)) {
      let newStreak;
      if (lastLogDate && isYesterday(today, lastLogDate)) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
      setStreak(newStreak);
      
      if (newStreak === 7 || newStreak === 30) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 6000); // Confetti for 6 seconds
      }
      
      setLastLogDate(today);
    }
  }, [lastLogDate, streak]);
  
  const handleAuthSuccess = () => {
    if (userProfile) {
      setCurrentScreen(Screen.Home);
    } else {
      setCurrentScreen(Screen.Onboarding);
    }
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setCurrentScreen(Screen.Home);
  };


  const saveExpense = useCallback((expenseData: Omit<Expense, 'id' | 'date'>) => {
    if (editingExpenseId) {
        setExpenses(prev => prev.map(e => e.id === editingExpenseId ? { ...e, ...expenseData, date: e.date } : e));
        setEditingExpenseId(null);
    } else {
        setExpenses(prev => [...prev, { ...expenseData, id: Date.now().toString(), date: new Date() }]);
        handleLogActivity();
    }
    setCurrentScreen(Screen.Home);
  }, [editingExpenseId, handleLogActivity]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setEditingExpenseId(null);
    setCurrentScreen(Screen.Home);
  }, []);
  
  const handleStartEditExpense = (id: string) => {
    setEditingExpenseId(id);
    setCurrentScreen(Screen.AddExpense);
  };

  const addMood = useCallback((moodData: { mood: MoodType, reason?: string }) => {
    setMoods(prev => [...prev, { id: Date.now().toString(), ...moodData, date: new Date() }]);
    handleLogActivity();
    setCurrentScreen(Screen.Home);
  }, [handleLogActivity]);

  const addNote = useCallback((content: string) => {
    setNotes(prev => [...prev, { id: Date.now().toString(), content, date: new Date() }]);
    setCurrentScreen(Screen.Home);
  }, []);

  const addFutureMessage = useCallback((content: string) => {
    setFutureMessages(prev => [...prev, { id: Date.now().toString(), content, date: new Date() }]);
    setCurrentScreen(Screen.Home);
  }, []);

  const growthScore = expenses.length + moods.length;
  const expenseToEdit = expenses.find(e => e.id === editingExpenseId) || null;

  if (!isInitialized) {
    return <div className="h-screen w-full flex items-center justify-center"><p>Loading...</p></div>;
  }
  
  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Welcome:
        return <WelcomeScreen onNavigate={() => setCurrentScreen(Screen.SignUpLogin)} />;
      case Screen.SignUpLogin:
        return <SignUpLoginScreen onAuthSuccess={handleAuthSuccess} />;
      case Screen.Onboarding:
        return <OnboardingScreen onSaveProfile={handleSaveProfile} />;
      case Screen.Home:
        return <HomeScreen userProfile={userProfile} expenses={expenses} moods={moods} onNavigate={setCurrentScreen} onEditExpense={handleStartEditExpense} streak={streak} challenge={challenge} growthScore={growthScore} showConfetti={showConfetti} />;
      case Screen.AddExpense:
        return <AddExpenseScreen userProfile={userProfile} onSave={saveExpense} onCancel={() => { setEditingExpenseId(null); setCurrentScreen(Screen.Home); }} onDelete={deleteExpense} expenseToEdit={expenseToEdit}/>;
      case Screen.MoodTracker:
        return <MoodTrackerScreen moods={moods} onSave={addMood} onCancel={() => setCurrentScreen(Screen.Home)} />;
      case Screen.Notes:
        return <NotesScreen onSave={addNote} onCancel={() => setCurrentScreen(Screen.Home)} />;
      case Screen.Insights:
        return <InsightsScreen userProfile={userProfile} expenses={expenses} moods={moods} />;
      case Screen.Profile:
        return <ProfileScreen userProfile={userProfile} settings={notificationSettings} onSettingsChange={updateNotificationSettings} onNavigate={(screen) => setCurrentScreen(screen)} />;
      case Screen.FutureMe:
        return <FutureMeScreen onSave={addFutureMessage} onCancel={() => setCurrentScreen(Screen.Home)} />;
      case Screen.Achievements:
        return <AchievementsScreen badges={achievements} onBack={() => setCurrentScreen(Screen.Profile)} />;
      default:
        return <HomeScreen userProfile={userProfile} expenses={expenses} moods={moods} onNavigate={setCurrentScreen} onEditExpense={handleStartEditExpense} streak={streak} challenge={challenge} growthScore={growthScore} showConfetti={showConfetti} />;
    }
  };
  
  const showBottomNav = ![Screen.Welcome, Screen.SignUpLogin, Screen.Onboarding].includes(currentScreen);

  return (
    <div className="min-h-screen bg-background font-sans text-primary">
      <div className="container mx-auto max-w-lg h-screen flex flex-col">
        <main className="flex-grow overflow-y-auto pb-24">
          {renderScreen()}
        </main>
        {showBottomNav && <BottomNav activeScreen={currentScreen} onNavigate={setCurrentScreen} />}
      </div>
    </div>
  );
};

export default App;