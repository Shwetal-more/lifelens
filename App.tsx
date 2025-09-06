import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Screen, Expense, MoodEntry, Note, MoodType, Badge, AchievementType, UserProfile, FinancialGoal, AevumVault, SavingsTarget, ChatMessage, GameState, BrixComponent, PlacedBrix, Notification, NotificationType, Income } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import SignUpLoginScreen from './screens/SignUpLoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import AddIncomeScreen from './screens/AddIncomeScreen';
import InnerCompassScreen from './screens/InnerCompassScreen';
import NotesScreen from './screens/NotesScreen';
import ProfileScreen from './screens/ProfileScreen';
import FinancialGoalsScreen from './screens/FinancialGoalsScreen';
import AddFinancialGoalScreen from './screens/AddFinancialGoalScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import BottomNav from './components/BottomNav';
import { getWeeklySmsInsight, getGoalRiddle, continueChat, getDailyVaultWhisper } from './services/geminiService';
import AevumVaultScreen from './screens/FutureMeScreen';
import SetVaultWishScreen from './screens/SetWishScreen';
import VaultRevealedScreen from './screens/WishRevealedScreen';
import GameScreen from './screens/GameScreen';
import ChatScreen from './screens/ChatScreen';
import SpendingCheckScreen from './screens/SpendingCheckScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import { speechService } from './services/speechService';
import SmsImportScreen from './screens/SmsImportScreen';
import { usePersistentState } from './hooks/usePersistentState';
import { sendNotification } from './services/notificationService';
import TutorialHighlight from './components/TutorialHighlight';
import { auth } from './services/firebase';


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

interface AppSettings {
    notifications: NotificationSettings;
    savingsTarget: SavingsTarget;
}

const initialAchievements: Badge[] = [
  { id: AchievementType.FIRST_WEEK_STREAK, name: 'First Week Streak', 'description': 'Maintain a 7-day streak.', unlocked: false },
  { id: AchievementType.MINDFUL_SPENDER, name: 'Mindful Spender', 'description': 'Log 5 expenses in a single day.', unlocked: false },
  { id: AchievementType.MOOD_MASTER, name: 'Mood Master', 'description': 'Log your mood for 7 consecutive days.', unlocked: false },
];

const COIN_CONVERSION_RATE = 2; // 1 currency unit = 2 Doubloons

// Helper function to calculate initially revealed land cells
const getInitialRevealedCells = () => {
    // Definitive Fix: Reveal the shipwreck and the correct adjacent land tile on the new bottom-left map area.
    return [
        { x: 2, y: 19 }, // Shipwreck 'H'
        { x: 2, y: 18 }, // The one starting land tile 'L'
    ];
};

const appTutorialConfig = [
    // --- HOME SCREEN ---
    { targetId: 'tutorial-welcome-header', screen: Screen.Home, title: "Welcome to LifeLens!", text: "I'm Kai, your personal guide. Let me show you around your new dashboard for financial and emotional wellness.", advancesBy: 'next' as const },
    { targetId: 'tutorial-summary-card', screen: Screen.Home, title: "Your 7-Day Summary", text: "This card gives you a quick overview of your recent income, expenses, and savings. It's your financial pulse.", advancesBy: 'next' as const },
    { targetId: 'tutorial-aevum-vault-card', screen: Screen.Home, title: "The Aevum Vault", text: "This is a special feature where you can seal goals with a message to your future self, unlocking it only when you succeed.", advancesBy: 'next' as const },
    { targetId: 'tutorial-log-activity-grid', screen: Screen.Home, title: "Log Your Activities", text: "The heart of LifeLens is here. Use these buttons to log expenses, income, and moods. Consistency unlocks powerful insights!", advancesBy: 'next' as const },
    { targetId: 'tutorial-ai-chat-button', screen: Screen.Home, title: "Chat With Me!", text: "Have a question or need advice? Tap my icon anytime to chat. I'm here to help you on your journey.", advancesBy: 'next' as const },
    
    // --- TRANSITION TO COMPASS ---
    { targetId: 'tutorial-nav-compass', screen: Screen.Home, title: "Discover Your Compass", text: "Now, let's explore your Inner Compass. This is where the magic happens. Tap the Compass icon to continue.", advancesBy: 'action' as const },
    
    // --- INNER COMPASS SCREEN ---
    { targetId: 'tutorial-compass-header', screen: Screen.InnerCompass, title: "Map Your Inner World", text: "This screen helps you understand the connection between your feelings and your spending habits.", advancesBy: 'next' as const },
    { targetId: 'tutorial-mood-tracker', screen: Screen.InnerCompass, title: "Track Your Mood", text: "Start by logging how you feel. Over time, you'll see how your emotions influence your financial choices.", advancesBy: 'next' as const },
    { targetId: 'tutorial-secret-pattern', screen: Screen.InnerCompass, title: "Unlock Secret Patterns", text: "As you add more data, I'll analyze it and reveal interesting patterns about your habits right here.", advancesBy: 'next' as const },

    // --- TRANSITION TO GAME ---
    { targetId: 'tutorial-nav-island', screen: Screen.InnerCompass, title: "Your Financial Legacy", text: "Finally, let's visit your island. Your real-world financial journey powers a game where you build a legacy. Tap the Island icon!", advancesBy: 'action' as const },
    
    // --- FULL MAP VIEW STEP ---
    { targetId: 'full-map-view-step', screen: Screen.Game, title: "A World of Possibility", text: "This is your island, shrouded in fog. Completing quests will reveal it piece by piece. Let's focus on your start.", advancesBy: 'next' as const },

    // --- HAND-OFF TO GAME ---
    { targetId: 'pirates-legacy-header', screen: Screen.Game, title: "Welcome to Your Island!", text: "Every saving and goal you achieve helps you build your paradise. A more detailed game tutorial will now begin. Enjoy!", advancesBy: 'next' as const },
];


const NotificationToast: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
    const typeStyles = {
        success: 'bg-green-100 border-green-400 text-green-700',
        error: 'bg-red-100 border-red-400 text-red-700',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700',
    };

    return (
        <div className={`p-4 border-l-4 rounded-r-lg shadow-lg animate-slide-in-out ${typeStyles[notification.type]}`}>
            <p className="font-semibold">{notification.message}</p>
        </div>
    );
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Welcome);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // --- Persistent State using custom hook ---
  const [userProfile, setUserProfile] = usePersistentState<UserProfile | null>('userProfile', null);
  const [expenses, setExpenses] = usePersistentState<Expense[]>('expenses', [
    { id: '1', amount: 75.50, category: 'Food', occasion: 'Dinner with friends', emotion: MoodType.Happy, date: new Date(Date.now() - 86400000 * 2), isUseful: false },
    { id: '2', amount: 120.00, category: 'Shopping', occasion: 'New shoes', emotion: MoodType.Stressed, date: new Date(Date.now() - 86400000 * 1), isUseful: false },
    { id: '3', amount: 15.00, category: 'Transport', occasion: 'Commute', emotion: MoodType.Neutral, date: new Date(), isUseful: true },
    { id: '4', amount: 45.00, category: 'Groceries', occasion: 'Weekly shop', emotion: MoodType.Neutral, date: new Date(), isUseful: true },
  ]);
  const [income, setIncome] = usePersistentState<Income[]>('income', [
      { id: 'i1', amount: 3500, source: 'Salary', date: new Date(Date.now() - 86400000 * 15) },
      { id: 'i2', amount: 250, source: 'Freelance', date: new Date(Date.now() - 86400000 * 5) },
  ]);
  const [moods, setMoods] = usePersistentState<MoodEntry[]>('moods', [
      { id: '1', mood: MoodType.Happy, date: new Date(Date.now() - 86400000 * 2), reason: 'A lovely day out.' },
      { id: '2', mood: MoodType.Stressed, date: new Date(Date.now() - 86400000 * 1), reason: 'Work deadline pressure.' },
      { id: '3', mood: MoodType.Excited, date: new Date(), reason: 'Weekend plans!' },
  ]);
  const [notes, setNotes] = usePersistentState<Note[]>('notes', []);
  const [goals, setGoals] = usePersistentState<FinancialGoal[]>('financialGoals', [
     { id: 'g1', name: 'Summer Vacation', targetAmount: 2000, savedAmount: 350, icon: '🌴', targetDate: '2024-08-31', isNorthStar: true }
  ]);
  const [gameState, setGameState] = usePersistentState<GameState>('gameState', { 
    spentBrixCoins: 0, 
    inventory: [], 
    placedBrix: [], 
    revealedCells: getInitialRevealedCells(), 
    quests: [], 
    questsCompletedSinceCooldown: 0, 
    isVoiceOverEnabled: true,
    clearedCells: [],
  });
  const [achievements, setAchievements] = usePersistentState<Badge[]>('achievements', initialAchievements);
  const [settings, setSettings] = usePersistentState<AppSettings>('appSettings', {
    notifications: { enabled: false, time: '19:00' },
    savingsTarget: { amount: 500, period: 'monthly' }
  });
  const [aevumVault, setAevumVault] = usePersistentState<AevumVault | null>('aevumVault', null);
  const [lastLogDate, setLastLogDate] = usePersistentState<Date | null>('lastLogDate', new Date());
  const [chatHistory, setChatHistory] = usePersistentState<ChatMessage[]>('chatHistory', []);
  const [hasSeenAppTutorial, setHasSeenAppTutorial] = usePersistentState('hasSeenAppTutorial', false);


  // --- Volatile App State ---
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingExpenseData, setPendingExpenseData] = useState<{ amount: string, category: string } | null>(null);
  const [streak, setStreak] = useState(1);
  const [pendingGoalForWish, setPendingGoalForWish] = useState<Omit<FinancialGoal, 'id'> | null>(null);
  const [revealedGoal, setRevealedGoal] = useState<FinancialGoal | null>(null);
  const [dailyWhisper, setDailyWhisper] = useState<string | null>(null);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [chatContext, setChatContext] = useState<'general' | 'game'>('general');
  const [showConfetti, setShowConfetti] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState('');
  const [appTutorialState, setAppTutorialState] = useState({ isActive: false, step: 0 });

  
  const insightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationSentToday = useRef(false);

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
      if (gameState.isVoiceOverEnabled) {
          speechService.speak(message);
      }
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
  }, [gameState.isVoiceOverEnabled]);

  useEffect(() => {
    // Initial setup based on persisted user profile
    if (userProfile) {
        setCurrentScreen(Screen.Home); 
        if (userProfile.age && chatHistory.length === 0) {
            setChatHistory([{
                role: 'model',
                content: `Welcome back, ${userProfile.name}! I'm Kai. How can I help you today?`,
                date: new Date()
            }]);
        }
    } else {
        setCurrentScreen(Screen.Welcome);
    }

    // Ensure game state integrity on load
    if (gameState && (!gameState.revealedCells || gameState.revealedCells.length === 0)) {
        setGameState(g => ({ ...g, revealedCells: getInitialRevealedCells() }));
    }
    
    setIsInitialized(true);
  }, []); // Only run once on initial load

  useEffect(() => {
    if (insightTimeoutRef.current) {
        clearTimeout(insightTimeoutRef.current);
    }
    
    insightTimeoutRef.current = setTimeout(() => {
        const fetchWeeklyInsight = async () => {
          if (!userProfile) return;
          const today = new Date();
          const lastWeek = new Date();
          lastWeek.setDate(today.getDate() - 7);
          
          const recentExpenses = expenses.filter(e => new Date(e.date) >= lastWeek);
          const recentMoods = moods.filter(m => new Date(m.date) >= lastWeek);

          if (recentExpenses.length === 0 && recentMoods.length === 0) {
            setWeeklyInsight('');
            return;
          }
          
          const insightText = await getWeeklySmsInsight(recentExpenses, recentMoods, userProfile);
          setWeeklyInsight(insightText);
        };
        fetchWeeklyInsight();
    }, 2000); // Debounce for 2 seconds

    return () => {
        if (insightTimeoutRef.current) {
            clearTimeout(insightTimeoutRef.current);
        }
    }
  }, [expenses, moods, userProfile]);

    useEffect(() => {
        if (revealedGoal) return; 

        const completedGoal = goals.find(g => g.savedAmount >= g.targetAmount);
        if (completedGoal && aevumVault && completedGoal.id === aevumVault.goalId) {
            setRevealedGoal(completedGoal);
            setCurrentScreen(Screen.VaultRevealed);
        }
    }, [goals, aevumVault, revealedGoal]);

  useEffect(() => {
    const checkAchievements = () => {
        let updated = false;
        const newAchievements: Badge[] = JSON.parse(JSON.stringify(achievements)); 

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
        }
    };
    checkAchievements();
  }, [expenses, moods, streak, achievements, setAchievements]);

  useEffect(() => {
    const fetchDailyWhisper = async () => {
        if (aevumVault) {
            const lastWhisperData = localStorage.getItem('dailyWhisper');
            let lastWhisper: { date: string, text: string } | null = null;
            if (lastWhisperData) {
                lastWhisper = JSON.parse(lastWhisperData);
            }

            const today = new Date().toDateString();

            if (lastWhisper && lastWhisper.date === today) {
                setDailyWhisper(lastWhisper.text);
            } else {
                const goal = goals.find(g => g.id === aevumVault.goalId);
                if (goal) {
                    const newWhisperText = await getDailyVaultWhisper(goal.name, aevumVault.message);
                    setDailyWhisper(newWhisperText);
                    localStorage.setItem('dailyWhisper', JSON.stringify({ date: today, text: newWhisperText }));
                }
            }
        }
    };
    fetchDailyWhisper();
  }, [aevumVault, goals]);


  useEffect(() => {
    if (settings.notifications.enabled) {
      const checkTime = setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Reset the notification flag at midnight
        if (currentTime === '00:00') {
            notificationSentToday.current = false;
        }

        if (currentTime === settings.notifications.time && !notificationSentToday.current) {
          notificationSentToday.current = true; // Prevent multiple notifications for the same minute
          const currencySymbol = userProfile ? { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥' }[userProfile.currency] : '$';
          const activeGoal = goals.find(g => g.savedAmount < g.targetAmount);

          if (activeGoal) {
            const message = `"${activeGoal.name}" is waiting! You've saved ${currencySymbol}${activeGoal.savedAmount} of ${currencySymbol}${activeGoal.targetAmount}. You're doing great!`;
            sendNotification("Your LifeLens Goal Reminder", message);
          } else {
            sendNotification("LifeLens Reminder", "Don't forget to set a new financial goal to keep your journey going!");
          }
        }
      }, 30000); // Check every 30 seconds to be safe
      return () => clearInterval(checkTime);
    }
  }, [settings.notifications, goals, userProfile]);

  const handleUpdateProfile = (updatedProfileData: Partial<UserProfile>) => {
    setUserProfile(prev => {
        if (!prev) return null;
        return { ...prev, ...updatedProfileData };
    });
  };
  
  const handleUpdateSettings = useCallback((updatedSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updatedSettings }));
  }, [setSettings]);

  const handleLogActivity = useCallback(() => {
    const today = new Date();
    if (!lastLogDate || !isSameDay(today, new Date(lastLogDate))) {
      let newStreak;
      if (lastLogDate && isYesterday(today, new Date(lastLogDate))) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
      setStreak(newStreak);
      
      if (newStreak === 7 || newStreak === 30) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 6000); 
      }
      
      setLastLogDate(today);
    }
  }, [lastLogDate, streak, setLastLogDate, setStreak]);
  
  const handleAuthSuccess = (authData: { name: string; email?: string; phone?: string }) => {
    const newUserProfile: UserProfile = {
        name: authData.name,
        email: authData.email,
        phone: authData.phone,
        age: 0, 
        currency: 'USD',
        smsEnabled: false,
    };
    setUserProfile(newUserProfile);
    setCurrentScreen(Screen.Onboarding);
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    
    setChatHistory([{
        role: 'model',
        content: `Hello ${profile.name}! I'm Kai, your personal financial assistant. How can I help you today?`,
        date: new Date()
    }]);

    setCurrentScreen(Screen.Home);

    if (!hasSeenAppTutorial) {
        setAppTutorialState({ isActive: true, step: 0 });
    }
  };
  
  const handleSendMessage = async (message: string) => {
    if (isAssistantLoading || !userProfile) return;

    const userMessage: ChatMessage = { role: 'user', content: message, date: new Date() };
    const currentHistory = [...chatHistory, userMessage];
    setChatHistory(currentHistory);
    setIsAssistantLoading(true);

    try {
        const responseText = await continueChat(userProfile, chatContext, chatHistory, message);
        const modelMessage: ChatMessage = { role: 'model', content: responseText, date: new Date() };
        setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Assistant error:", error);
        const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later.", date: new Date() };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsAssistantLoading(false);
    }
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
  }, [editingExpenseId, handleLogActivity, setExpenses]);
  
  const addIncome = useCallback((incomeData: Omit<Income, 'id' | 'date'>) => {
    setIncome(prev => [...prev, { ...incomeData, id: Date.now().toString(), date: new Date() }]);
    handleLogActivity();
    setCurrentScreen(Screen.Home);
  }, [handleLogActivity, setIncome]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setEditingExpenseId(null);
    setCurrentScreen(Screen.Home);
  }, [setExpenses]);
  
  const handleStartEditExpense = (id: string) => {
    setEditingExpenseId(id);
    setCurrentScreen(Screen.AddExpense);
  };

  const addMood = useCallback((moodData: { mood: MoodType, reason?: string }) => {
    setMoods(prev => [...prev, { id: Date.now().toString(), ...moodData, date: new Date() }]);
    handleLogActivity();
  }, [handleLogActivity, setMoods]);

  const addNote = useCallback((content: string) => {
    setNotes(prev => [...prev, { id: Date.now().toString(), content, date: new Date() }]);
    setCurrentScreen(Screen.Home);
  }, [setNotes]);

  const addFinancialGoal = useCallback((goalData: Omit<FinancialGoal, 'id'>) => {
      if (goals.length === 0 && !aevumVault) {
        setPendingGoalForWish(goalData);
        setCurrentScreen(Screen.SetVaultWish);
      } else {
        setGoals(prev => [...prev, { ...goalData, id: Date.now().toString() }]);
        setCurrentScreen(Screen.FinancialGoals);
      }
  }, [goals, aevumVault, setGoals]);

  const sealVault = async (message: string) => {
      if (!pendingGoalForWish) return;
      const goalId = Date.now().toString();

      const riddle = await getGoalRiddle(pendingGoalForWish.name);
      
      setAevumVault({ goalId, message, riddle });
      
      const newGoal: FinancialGoal = { ...pendingGoalForWish, id: goalId, isNorthStar: true };
      setGoals(prev => [...prev, newGoal]);

      setPendingGoalForWish(null);
      setCurrentScreen(Screen.FinancialGoals);
  };

  const cancelVault = () => {
    setPendingGoalForWish(null);
    setCurrentScreen(Screen.AddFinancialGoal);
  }

  const handleCloseVault = () => {
    if(revealedGoal) {
        setGoals(prev => prev.filter(g => g.id !== revealedGoal.id));
        setAevumVault(null);
        localStorage.removeItem('dailyWhisper');
        setDailyWhisper(null);
    }
    setRevealedGoal(null);
    setCurrentScreen(Screen.Home);
  };

  const handlePrepareExpense = (data: { amount: string, category: string }) => {
    setPendingExpenseData(data);
    setCurrentScreen(Screen.AddExpense);
  };
  
  const handleLogout = () => {
    auth.signOut().then(() => {
        localStorage.clear();
        window.location.reload();
    }).catch((error) => {
        console.error("Logout Error:", error);
        // Fallback to clear local data even if Firebase signout fails
        localStorage.clear();
        window.location.reload();
    });
  };

  const totalSaved = useMemo(() => goals.reduce((sum, g) => sum + g.savedAmount, 0), [goals]);
  const brixCoins = useMemo(() => {
    const earned = totalSaved * COIN_CONVERSION_RATE;
    return Math.floor(earned - gameState.spentBrixCoins);
  }, [totalSaved, gameState.spentBrixCoins]);

  const handlePurchaseBrix = useCallback((brix: BrixComponent) => {
      const earned = totalSaved * COIN_CONVERSION_RATE;
      const currentCoins = Math.floor(earned - gameState.spentBrixCoins);

      if (currentCoins >= brix.cost) {
          setGameState(prev => {
              const newInventory = [...prev.inventory];
              const existingBrix = newInventory.find(item => item.brixId === brix.id);
              if (existingBrix) {
                  existingBrix.quantity += 1;
              } else {
                  newInventory.push({ brixId: brix.id, quantity: 1 });
              }
              return {
                  ...prev,
                  spentBrixCoins: prev.spentBrixCoins + brix.cost,
                  inventory: newInventory,
              };
          });
          addNotification(`'${brix.name}' added to yer cargo!`, 'success');
          return true;
      } else {
          addNotification("Not enough Doubloons!", 'error');
          return false;
      }
  }, [gameState, totalSaved, addNotification, setGameState]);

  const handlePlaceBrix = useCallback((brixId: string, x: number, y: number) => {
      setGameState(prev => {
          const inventory = [...prev.inventory];
          const brixInInventory = inventory.find(b => b.brixId === brixId);

          if (brixInInventory && brixInInventory.quantity > 0) {
              brixInInventory.quantity -= 1;
              
              const newInventory = inventory.filter(b => b.quantity > 0);

              const newPlacedBrix: PlacedBrix = {
                  instanceId: Date.now().toString(),
                  brixId,
                  x,
                  y,
              };

              return {
                  ...prev,
                  inventory: newInventory,
                  placedBrix: [...prev.placedBrix, newPlacedBrix],
              };
          }
          return prev;
      });
  }, [setGameState]);
  
  const handleNavigateToChat = (context: 'general' | 'game') => {
      setChatContext(context);
      setCurrentScreen(Screen.Chat);
  }

  const expenseToEdit = expenses.find(e => e.id === editingExpenseId) || null;

  // --- App Tutorial Logic ---
  const handleAppTutorialSkip = useCallback(() => {
    setAppTutorialState({ isActive: false, step: 0 });
    setHasSeenAppTutorial(true);
    speechService.cancel();
  }, [setHasSeenAppTutorial]);

  const handleAppTutorialNext = useCallback(() => {
    setAppTutorialState(prev => {
      const nextStepIndex = prev.step + 1;
      if (nextStepIndex >= appTutorialConfig.length) {
        // This is the "Finish" action.
        setHasSeenAppTutorial(true);
        speechService.cancel();
        // Return the new state to close the tutorial.
        return { isActive: false, step: 0 };
      }
      // Advance to the next step.
      return { ...prev, step: nextStepIndex };
    });
  }, [setHasSeenAppTutorial]);
  
  const handleNavigation = (screen: Screen) => {
    if (appTutorialState.isActive) {
        const currentStepConfig = appTutorialConfig[appTutorialState.step];
        const nextStepConfig = appTutorialConfig[appTutorialState.step + 1];

        // Check if this navigation is the action the tutorial is waiting for
        if (currentStepConfig.advancesBy === 'action' && nextStepConfig && nextStepConfig.screen === screen) {
            handleAppTutorialNext();
        }
    }
    setCurrentScreen(screen);
  };
  
  // --- Screen Rendering ---
  if (!isInitialized) {
    return <div className="h-full w-full flex items-center justify-center"><p>Loading...</p></div>;
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
        return <HomeScreen userProfile={userProfile} expenses={expenses} income={income} onNavigate={setCurrentScreen} onNavigateToChat={handleNavigateToChat} onEditExpense={handleStartEditExpense} streak={streak} aevumVault={aevumVault} dailyWhisper={dailyWhisper} totalSaved={totalSaved} showConfetti={showConfetti} weeklyInsight={weeklyInsight} savingsTarget={settings.savingsTarget} />;
      case Screen.AddExpense:
        return <AddExpenseScreen userProfile={userProfile} onSave={saveExpense} onCancel={() => { setEditingExpenseId(null); setCurrentScreen(Screen.Home); }} onDelete={deleteExpense} expenseToEdit={expenseToEdit} expenses={expenses} goals={goals} addNotification={addNotification} pendingData={pendingExpenseData} onClearPendingData={() => setPendingExpenseData(null)} />;
      case Screen.AddIncome:
        return <AddIncomeScreen onSave={addIncome} onCancel={() => setCurrentScreen(Screen.Home)} userProfile={userProfile} />;
      case Screen.InnerCompass:
        return <InnerCompassScreen expenses={expenses} moods={moods} userProfile={userProfile} onSaveMood={addMood} />;
      case Screen.Notes:
        return <NotesScreen onSave={addNote} onCancel={() => setCurrentScreen(Screen.Home)} />;
      case Screen.Profile:
        return <ProfileScreen userProfile={userProfile} settings={settings} onSettingsChange={handleUpdateSettings} onProfileChange={handleUpdateProfile} onNavigate={(screen) => setCurrentScreen(screen)} onLogout={handleLogout} />;
      case Screen.FinancialGoals:
        return <FinancialGoalsScreen goals={goals} onNavigate={setCurrentScreen} userProfile={userProfile} />;
      case Screen.AddFinancialGoal:
        return <AddFinancialGoalScreen onSave={addFinancialGoal} onCancel={() => setCurrentScreen(Screen.FinancialGoals)} userProfile={userProfile} addNotification={addNotification}/>;
      case Screen.Achievements:
        return <AchievementsScreen badges={achievements} onBack={() => setCurrentScreen(Screen.Profile)} />;
      case Screen.AevumVault:
        return <AevumVaultScreen onSave={addNote} onCancel={() => setCurrentScreen(Screen.Home)} />;
      case Screen.SetVaultWish:
        return <SetVaultWishScreen pendingGoalName={pendingGoalForWish?.name || 'your goal'} onSaveWish={sealVault} onCancel={cancelVault} addNotification={addNotification} />;
      case Screen.VaultRevealed:
        if (revealedGoal && aevumVault) {
            return <VaultRevealedScreen goal={revealedGoal} message={aevumVault.message} onDone={handleCloseVault} />;
        }
        return <HomeScreen userProfile={userProfile} expenses={expenses} income={income} onNavigate={setCurrentScreen} onNavigateToChat={handleNavigateToChat} onEditExpense={handleStartEditExpense} streak={streak} aevumVault={aevumVault} dailyWhisper={dailyWhisper} totalSaved={totalSaved} showConfetti={showConfetti} weeklyInsight={weeklyInsight} savingsTarget={settings.savingsTarget} />;
      case Screen.Game:
        const currentTutorialStepId = appTutorialState.isActive ? appTutorialConfig[appTutorialState.step].targetId : null;
        return <GameScreen brixCoins={brixCoins} gameState={gameState} onUpdateGameState={setGameState} onPurchaseBrix={handlePurchaseBrix} onPlaceBrix={handlePlaceBrix} onNavigateToChat={handleNavigateToChat} userName={userProfile?.name || 'Explorer'} addNotification={addNotification} isAppTutorialRunning={appTutorialState.isActive} appTutorialStepId={currentTutorialStepId} />;
      case Screen.Chat:
        return <ChatScreen history={chatHistory} onSendMessage={handleSendMessage} onCancel={() => setCurrentScreen(Screen.Home)} userName={userProfile?.name || 'Explorer'} isLoading={isAssistantLoading} />;
      case Screen.SpendingCheck:
        return <SpendingCheckScreen userProfile={userProfile} goals={goals} onNavigate={setCurrentScreen} onPrepareExpense={handlePrepareExpense} addNotification={addNotification} />;
      case Screen.PrivacyPolicy:
        return <PrivacyPolicyScreen onBack={() => setCurrentScreen(Screen.Profile)} />;
      case Screen.SmsImport:
        return <SmsImportScreen onNavigate={setCurrentScreen} onPrepareExpense={handlePrepareExpense} addNotification={addNotification} />;
      default:
        return <HomeScreen userProfile={userProfile} expenses={expenses} income={income} onNavigate={setCurrentScreen} onNavigateToChat={handleNavigateToChat} onEditExpense={handleStartEditExpense} streak={streak} aevumVault={aevumVault} dailyWhisper={dailyWhisper} totalSaved={totalSaved} showConfetti={showConfetti} weeklyInsight={weeklyInsight} savingsTarget={settings.savingsTarget} />;
    }
  };
  
  const showNav = ![Screen.Welcome, Screen.SignUpLogin, Screen.Onboarding, Screen.SetVaultWish, Screen.VaultRevealed, Screen.Chat, Screen.PrivacyPolicy].includes(currentScreen);

  return (
    <div className="h-full bg-background font-sans text-primary">
        {appTutorialState.isActive && (
            <TutorialHighlight
                targetId={appTutorialConfig[appTutorialState.step].targetId}
                title={appTutorialConfig[appTutorialState.step].title}
                text={appTutorialConfig[appTutorialState.step].text}
                step={appTutorialState.step}
                totalSteps={appTutorialConfig.length}
                onNext={handleAppTutorialNext}
                onSkip={handleAppTutorialSkip}
                isVoiceOverEnabled={gameState.isVoiceOverEnabled ?? true}
                advancesBy={appTutorialConfig[appTutorialState.step].advancesBy}
            />
        )}
       <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 space-y-2">
            {notifications.map(notification => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onDismiss={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                />
            ))}
        </div>
        <style>{`
            @keyframes slideInOut {
                0% { transform: translateY(-100%); opacity: 0; }
                15% { transform: translateY(0); opacity: 1; }
                85% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-100%); opacity: 0; }
            }
            .animate-slide-in-out {
                animation: slideInOut 4s ease-in-out forwards;
            }
        `}</style>

      <div className="h-full flex flex-col">
        <main className="flex-grow overflow-y-auto hide-scrollbar pb-24">
            <div className="w-full max-w-2xl mx-auto">
              {renderScreen()}
            </div>
        </main>
        {showNav && <BottomNav activeScreen={currentScreen} onNavigate={handleNavigation} />}
      </div>
    </div>
  );
};

export default App;