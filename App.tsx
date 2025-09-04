import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Screen, Expense, MoodEntry, Note, MoodType, Badge, AchievementType, UserProfile, FinancialGoal, AevumVault, SavingsTarget, ChatMessage, GameState, BrixComponent, PlacedBrix, Notification, NotificationType } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import SignUpLoginScreen from './screens/SignUpLoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import InnerCompassScreen from './screens/InnerCompassScreen';
import NotesScreen from './screens/NotesScreen';
import ProfileScreen from './screens/ProfileScreen';
import FinancialGoalsScreen from './screens/FinancialGoalsScreen';
import AddFinancialGoalScreen from './screens/AddFinancialGoalScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import BottomNav from './components/BottomNav';
import { getWeeklySmsInsight, getGoalRiddle, startChatSession, getDailyVaultWhisper } from './services/geminiService';
import AevumVaultScreen from './screens/FutureMeScreen';
import SetVaultWishScreen from './screens/SetWishScreen';
import VaultRevealedScreen from './screens/WishRevealedScreen';
import GameScreen from './screens/GameScreen';
import ChatScreen from './screens/ChatScreen';
import { Chat } from '@google/genai';


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
  { id: AchievementType.FIRST_WEEK_STREAK, name: 'First Week Streak', description: 'Maintain a 7-day streak.', unlocked: false },
  { id: AchievementType.MINDFUL_SPENDER, name: 'Mindful Spender', description: 'Log 5 expenses in a single day.', unlocked: false },
  { id: AchievementType.MOOD_MASTER, name: 'Mood Master', description: 'Log your mood for 7 consecutive days.', unlocked: false },
];

const COIN_CONVERSION_RATE = 2; // 1 currency unit = 2 Doubloons

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', amount: 75.50, category: 'Food', occasion: 'Dinner with friends', emotion: MoodType.Happy, date: new Date(Date.now() - 86400000 * 2), isUseful: false },
    { id: '2', amount: 120.00, category: 'Shopping', occasion: 'New shoes', emotion: MoodType.Stressed, date: new Date(Date.now() - 86400000 * 1), isUseful: false },
    { id: '3', amount: 15.00, category: 'Transport', occasion: 'Commute', emotion: MoodType.Neutral, date: new Date(), isUseful: true },
    { id: '4', amount: 45.00, category: 'Groceries', occasion: 'Weekly shop', emotion: MoodType.Neutral, date: new Date(), isUseful: true },
  ]);

  const [moods, setMoods] = useState<MoodEntry[]>([
      { id: '1', mood: MoodType.Happy, date: new Date(Date.now() - 86400000 * 2), reason: 'A lovely day out.' },
      { id: '2', mood: MoodType.Stressed, date: new Date(Date.now() - 86400000 * 1), reason: 'Work deadline pressure.' },
      { id: '3', mood: MoodType.Excited, date: new Date(), reason: 'Weekend plans!' },
  ]);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([
     { id: 'g1', name: 'Summer Vacation', targetAmount: 2000, savedAmount: 350, icon: '🌴', targetDate: '2024-08-31', isNorthStar: true }
  ]);
  
  const [gameState, setGameState] = useState<GameState>({ spentBrixCoins: -1000, inventory: [], placedBrix: [], revealedCells: [
    {x:12, y:6}, {x:11, y:7}, {x:12, y:7}, {x:13, y:7}, {x:12, y:8} // Start area revealed
  ], quests: [] });

  // Editing state
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Gamification State
  const [streak, setStreak] = useState(1);
  const [lastLogDate, setLastLogDate] = useState<Date | null>(new Date());
  const [aevumVault, setAevumVault] = useState<AevumVault | null>(null);
  const [pendingGoalForWish, setPendingGoalForWish] = useState<Omit<FinancialGoal, 'id'> | null>(null);
  const [revealedGoal, setRevealedGoal] = useState<FinancialGoal | null>(null);
  const [dailyWhisper, setDailyWhisper] = useState<string | null>(null);
  
  // AI Assistant State
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [chatContext, setChatContext] = useState<'general' | 'game'>('general');

  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState<Badge[]>(initialAchievements);
  const [weeklyInsight, setWeeklyInsight] = useState('');
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    notifications: { enabled: false, time: '19:00' },
    savingsTarget: { amount: 500, period: 'monthly' }
  });
  
  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
  }, []);

  useEffect(() => {
    const savedProfileData = localStorage.getItem('userProfile');
    if (savedProfileData) {
        const profile = JSON.parse(savedProfileData);
        setUserProfile(profile);
        if (profile.age) {
            const chatSession = startChatSession(profile, chatContext);
            setChat(chatSession);
            const savedHistory = localStorage.getItem('chatHistory');
            if (!savedHistory) {
                setChatHistory([{
                    role: 'model',
                    content: `Welcome back, ${profile.name}! I'm Kai. How can I help you today?`,
                    date: new Date()
                }]);
            }
        }
    }
    
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
    
    const savedGoals = localStorage.getItem('financialGoals');
    if (savedGoals) setGoals(JSON.parse(savedGoals, (key, value) => key === 'date' ? new Date(value) : value));
    
    const savedVault = localStorage.getItem('aevumVault');
    if(savedVault) setAevumVault(JSON.parse(savedVault));
    
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
        setChatHistory(JSON.parse(savedChatHistory, (key, value) => key === 'date' ? new Date(value) : value));
    }
    
    const savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
        const loadedState = JSON.parse(savedGameState);
        if (!loadedState.revealedCells) {
            loadedState.revealedCells = [{x:12, y:6}, {x:11, y:7}, {x:12, y:7}, {x:13, y:7}, {x:12, y:8}];
        }
        setGameState(loadedState);
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (chatHistory.length > 1) { // Don't save initial message
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);
  
  useEffect(() => {
     if (userProfile?.age) {
        const chatSession = startChatSession(userProfile, chatContext);
        setChat(chatSession);
     }
  }, [chatContext, userProfile]);

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const fetchWeeklyInsight = async () => {
      if (!userProfile) return;
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      const recentExpenses = expenses.filter(e => new Date(e.date) >= lastWeek);
      const recentMoods = moods.filter(m => new Date(m.date) >= lastWeek);
      
      const insightText = await getWeeklySmsInsight(recentExpenses, recentMoods, userProfile.name || 'Explorer');
      setWeeklyInsight(insightText);
    };
    fetchWeeklyInsight();
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
            localStorage.setItem('achievements', JSON.stringify(newAchievements));
        }
    };
    checkAchievements();
  }, [expenses, moods, streak, achievements]);

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
            if (currentTime === settings.notifications.time) {
                addNotification("LifeLens Reminder: Time to log your mood and expenses!", 'info');
            }
        }, 60000); 
        return () => clearInterval(checkTime);
    }
  }, [settings.notifications, addNotification]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      localStorage.setItem('appSettings', JSON.stringify(updated));
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
        setTimeout(() => setShowConfetti(false), 6000); 
      }
      
      setLastLogDate(today);
    }
  }, [lastLogDate, streak]);
  
  const handleAuthSuccess = () => {
    if (userProfile && userProfile.age > 0) {
      setCurrentScreen(Screen.Home);
    } else {
      setCurrentScreen(Screen.Onboarding);
    }
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));

    const savedGameState = localStorage.getItem('gameState');
    if (!savedGameState) {
        const initialGameState: GameState = {
            spentBrixCoins: -1000,
            inventory: [],
            placedBrix: [],
            revealedCells: [{x:12, y:6}, {x:11, y:7}, {x:12, y:7}, {x:13, y:7}, {x:12, y:8}],
            quests: [],
        };
        setGameState(initialGameState);
        localStorage.setItem('gameState', JSON.stringify(initialGameState));
    }
    
    const chatSession = startChatSession(profile, 'general');
    setChat(chatSession);
    setChatHistory([{
        role: 'model',
        content: `Hello ${profile.name}! I'm Kai, your personal financial assistant. How can I help you today?`,
        date: new Date()
    }]);

    setCurrentScreen(Screen.Home);
  };
  
  const handleSendMessage = async (message: string) => {
    if (!chat || isAssistantLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: message, date: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setIsAssistantLoading(true);

    try {
        const response = await chat.sendMessage({ message });
        const modelMessage: ChatMessage = { role: 'model', content: response.text, date: new Date() };
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
  }, [handleLogActivity]);

  const addNote = useCallback((content: string) => {
    setNotes(prev => [...prev, { id: Date.now().toString(), content, date: new Date() }]);
    setCurrentScreen(Screen.Home);
  }, []);

  const addFinancialGoal = useCallback((goalData: Omit<FinancialGoal, 'id'>) => {
      if (goals.length === 0 && !aevumVault) {
        setPendingGoalForWish(goalData);
        setCurrentScreen(Screen.SetVaultWish);
      } else {
        const newGoals = [...goals, { ...goalData, id: Date.now().toString() }];
        setGoals(newGoals);
        localStorage.setItem('financialGoals', JSON.stringify(newGoals));
        setCurrentScreen(Screen.FinancialGoals);
      }
  }, [goals, aevumVault]);

  const sealVault = async (message: string) => {
      if (!pendingGoalForWish) return;
      const goalId = Date.now().toString();

      const riddle = await getGoalRiddle(pendingGoalForWish.name);
      
      const newVault: AevumVault = { goalId, message, riddle };
      setAevumVault(newVault);
      localStorage.setItem('aevumVault', JSON.stringify(newVault));
      
      const newGoal: FinancialGoal = { ...pendingGoalForWish, id: goalId, isNorthStar: true };
      const newGoals = [...goals, newGoal];
      setGoals(newGoals);
      localStorage.setItem('financialGoals', JSON.stringify(newGoals));

      setPendingGoalForWish(null);
      setCurrentScreen(Screen.FinancialGoals);
  };

  const cancelVault = () => {
    setPendingGoalForWish(null);
    setCurrentScreen(Screen.AddFinancialGoal);
  }

  const handleCloseVault = () => {
    if(revealedGoal) {
        const newGoals = goals.filter(g => g.id !== revealedGoal.id);
        setGoals(newGoals);
        localStorage.setItem('financialGoals', JSON.stringify(newGoals));
        
        setAevumVault(null);
        localStorage.removeItem('aevumVault');
        localStorage.removeItem('dailyWhisper');
        setDailyWhisper(null);
    }
    setRevealedGoal(null);
    setCurrentScreen(Screen.Home);
  };
  
  const totalSaved = useMemo(() => goals.reduce((sum, g) => sum + g.savedAmount, 0), [goals]);
  const brixCoins = useMemo(() => {
    const earned = totalSaved * COIN_CONVERSION_RATE;
    return Math.floor(earned - gameState.spentBrixCoins);
  }, [totalSaved, gameState.spentBrixCoins]);

  const handlePurchaseBrix = useCallback((brix: BrixComponent) => {
      if (brixCoins >= brix.cost) {
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
  }, [brixCoins, addNotification]);

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
  }, []);
  
  const handleNavigateToChat = (context: 'general' | 'game') => {
      setChatContext(context);
      setCurrentScreen(Screen.Chat);
  }

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
        return <HomeScreen userProfile={userProfile} expenses={expenses} onNavigate={setCurrentScreen} onNavigateToChat={handleNavigateToChat} onEditExpense={handleStartEditExpense} streak={streak} aevumVault={aevumVault} dailyWhisper={dailyWhisper} totalSaved={totalSaved} showConfetti={showConfetti} weeklyInsight={weeklyInsight} savingsTarget={settings.savingsTarget} />;
      case Screen.AddExpense:
        return <AddExpenseScreen userProfile={userProfile} onSave={saveExpense} onCancel={() => { setEditingExpenseId(null); setCurrentScreen(Screen.Home); }} onDelete={deleteExpense} expenseToEdit={expenseToEdit} goals={goals} addNotification={addNotification} />;
      case Screen.InnerCompass:
        return <InnerCompassScreen expenses={expenses} moods={moods} userProfile={userProfile} onSaveMood={addMood} />;
      case Screen.Notes:
        return <NotesScreen onSave={addNote} onCancel={() => setCurrentScreen(Screen.Home)} />;
      case Screen.Profile:
        return <ProfileScreen userProfile={userProfile} settings={settings} onSettingsChange={updateSettings} onNavigate={(screen) => setCurrentScreen(screen)} />;
      case Screen.FinancialGoals:
        return <FinancialGoalsScreen goals={goals} onNavigate={setCurrentScreen} />;
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
        return <HomeScreen userProfile={userProfile} expenses={expenses} onNavigate={setCurrentScreen} onNavigateToChat={handleNavigateToChat} onEditExpense={handleStartEditExpense} streak={streak} aevumVault={aevumVault} dailyWhisper={dailyWhisper} totalSaved={totalSaved} showConfetti={showConfetti} weeklyInsight={weeklyInsight} savingsTarget={settings.savingsTarget} />;
      case Screen.Game:
        return <GameScreen brixCoins={brixCoins} gameState={gameState} onUpdateGameState={setGameState} onPurchaseBrix={handlePurchaseBrix} onPlaceBrix={handlePlaceBrix} onNavigateToChat={handleNavigateToChat} userName={userProfile?.name || 'Explorer'} />;
      case Screen.Chat:
        return <ChatScreen history={chatHistory} onSendMessage={handleSendMessage} onCancel={() => setCurrentScreen(Screen.Home)} userName={userProfile?.name || 'Explorer'} isLoading={isAssistantLoading} />;
      default:
        return <HomeScreen userProfile={userProfile} expenses={expenses} onNavigate={setCurrentScreen} onNavigateToChat={handleNavigateToChat} onEditExpense={handleStartEditExpense} streak={streak} aevumVault={aevumVault} dailyWhisper={dailyWhisper} totalSaved={totalSaved} showConfetti={showConfetti} weeklyInsight={weeklyInsight} savingsTarget={settings.savingsTarget} />;
    }
  };
  
  const showBottomNav = ![Screen.Welcome, Screen.SignUpLogin, Screen.Onboarding, Screen.SetVaultWish, Screen.VaultRevealed, Screen.Chat].includes(currentScreen);

  return (
    <div className="min-h-screen bg-background font-sans text-primary">
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