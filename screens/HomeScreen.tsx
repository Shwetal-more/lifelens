import React, { useMemo } from 'react';
import { Expense, Screen, UserProfile, AevumVault, SavingsTarget, Income } from '../types';

// A simple placeholder for a confetti component
const Confetti: React.FC = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 9999
  }}>
    <div className="absolute animate-fall">🎉</div>
    <div className="absolute animate-fall" style={{ left: '10%', animationDelay: '1s' }}>🎊</div>
    <div className="absolute animate-fall" style={{ left: '20%', animationDelay: '0.5s' }}>🎈</div>
    <div className="absolute animate-fall" style={{ left: '30%', animationDelay: '1.5s' }}>✨</div>
    <div className="absolute animate-fall" style={{ left: '40%', animationDelay: '2s' }}>🎁</div>
    <div className="absolute animate-fall" style={{ left: '50%', animationDelay: '0.2s' }}>🎊</div>
    <div className="absolute animate-fall" style={{ left: '60%', animationDelay: '1.8s' }}>🎉</div>
    <div className="absolute animate-fall" style={{ left: '70%', animationDelay: '0.8s' }}>🎈</div>
    <div className="absolute animate-fall" style={{ left: '80%', animationDelay: '1.2s' }}>✨</div>
    <div className="absolute animate-fall" style={{ left: '90%', animationDelay: '2.5s' }}>🎁</div>
    <style>{`
      @keyframes fall {
        0% { transform: translateY(-10vh); opacity: 1; }
        100% { transform: translateY(100vh); opacity: 0; }
      }
      .animate-fall {
        animation: fall 6s linear infinite;
        font-size: 2rem;
      }
    `}</style>
  </div>
);


interface HomeScreenProps {
  userProfile: UserProfile | null;
  expenses: Expense[];
  income: Income[];
  onNavigate: (screen: Screen) => void;
  onNavigateToChat: (context: 'general' | 'game') => void;
  onEditExpense: (id: string) => void;
  streak: number;
  aevumVault: AevumVault | null;
  dailyWhisper: string | null;
  totalSaved: number;
  showConfetti: boolean;
  weeklyInsight: string;
  savingsTarget: SavingsTarget;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
};

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const SmsIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

const IncomeIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125-1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m16.5 0h.375a1.125 1.125 0 0 1 1.125 1.125v9.75c0 .621-.504 1.125-1.125-1.125h-.375m0 0V6.375m0 12.375-1.5-1.5m1.5 1.5-1.5-1.5m0 0H3.75m16.5 0-1.5 1.5m-15-1.5L5.25 18l-1.5-1.5m15 0-1.5 1.5m1.5-1.5L18.75 18l1.5-1.5" />
    </svg>
);


const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const AiIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const PirateIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path d="M4.008 2.158A17.916 17.916 0 0112 2c4.173 0 8.024 1.482 10.992 4.008" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 21h19.5" />
        <path d="M5.38 5.38a18.235 18.235 0 00-2.228 4.293 8.966 8.966 0 011.694-.228c.36-.027.72.01.95.228.23.218.35.539.35.856v1.378c0 .588.293 1.152.758 1.502.466.35.93.838 1.434 1.342m5.656-3.064a8.966 8.966 0 011.694.228c.36.027.72-.01.95-.228.23-.218.35.539.35-.856V9.673c0-.588.293-1.152.758-1.502.466.35.93-.838 1.434-1.342m-5.302 5.302c.492.492 1.07.912 1.634 1.342.565.43 1.223.823 1.842 1.18.62.357 1.294.643 2.018.846" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25c-2.336 0-4.5.63-4.5 2.25s2.164 2.25 4.5 2.25 4.5-.63 4.5-2.25S14.336 8.25 12 8.25z" />
        <path d="M12 12.75a2.25 2.25 0 002.25-2.25H9.75A2.25 2.25 0 0012 12.75z" />
    </svg>
);

const VaultIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
);

const NudgeIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ userProfile, expenses, income, onNavigate, onNavigateToChat, onEditExpense, streak, aevumVault, dailyWhisper, totalSaved, showConfetti, weeklyInsight, savingsTarget }) => {
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';
  
  const financialSummary = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(new Date().setDate(now.getDate() - 7));
    
    const totalIncome = income
      .filter(i => new Date(i.date) >= last7Days)
      .reduce((sum, i) => sum + i.amount, 0);

    const totalExpenses = expenses
      .filter(e => new Date(e.date) >= last7Days)
      .reduce((sum, e) => sum + e.amount, 0);
      
    const savings = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, savings };
  }, [income, expenses]);

  const savingsProgress = savingsTarget.amount > 0 ? Math.min((totalSaved / savingsTarget.amount) * 100, 100) : 0;
  const savingsGoalMet = savingsProgress >= 100;

  return (
    <div className="p-4 space-y-6 relative">
      {showConfetti && <Confetti />}

      { userProfile && userProfile.age > 0 && (
         <button
            id="tutorial-ai-chat-button"
            onClick={() => onNavigateToChat('general')}
            className="fixed bottom-28 right-4 bg-primary text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform z-40"
            aria-label="Open AI Assistant"
         >
            <AiIcon className="w-8 h-8"/>
         </button>
      )}

      <header id="tutorial-welcome-header" className="pt-4">
        <p className="text-secondary text-lg">Hello, {userProfile?.name || 'Explorer'}!</p>
        <h1 className="text-3xl font-bold text-primary">Ready for today's journey?</h1>
      </header>
      
      <div id="tutorial-summary-card" className="bg-card p-5 rounded-2xl shadow-card">
          <h3 className="font-bold text-lg text-primary mb-3">7-Day Summary</h3>
          <div className="flex justify-around text-center">
              <div>
                  <p className="text-sm text-secondary">Income</p>
                  <p className="font-bold text-xl text-green-500">{currencySymbol}{financialSummary.totalIncome.toFixed(0)}</p>
              </div>
              <div>
                  <p className="text-sm text-secondary">Expenses</p>
                  <p className="font-bold text-xl text-red-500">{currencySymbol}{financialSummary.totalExpenses.toFixed(0)}</p>
              </div>
              <div>
                  <p className="text-sm text-secondary">Savings</p>
                  <p className={`font-bold text-xl ${financialSummary.savings >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                    {currencySymbol}{financialSummary.savings.toFixed(0)}
                  </p>
              </div>
          </div>
      </div>
      
      {aevumVault && dailyWhisper ? (
        <div className="bg-card p-5 rounded-2xl shadow-card text-center">
          <h2 className="font-bold text-lg text-primary mb-2 flex items-center justify-center gap-2">
            <VaultIcon className="w-6 h-6 text-accent"/>
            A Whisper from the Vault
          </h2>
          <p className="font-semibold text-secondary text-lg italic">"{dailyWhisper}"</p>
          <p className="text-xs text-gray-400 mt-2">A new message awaits you each day.</p>
        </div>
      ) : (
        <div id="tutorial-aevum-vault-card" className="bg-card p-5 rounded-2xl shadow-card text-center">
          <h2 className="font-bold text-lg text-primary mb-2 flex items-center justify-center gap-2">
            <VaultIcon className="w-6 h-6 text-accent"/>
            The Aevum Vault Awaits
          </h2>
          <p className="text-secondary text-sm mb-4">Seal your most important goal with a message to your future self.</p>
          <button 
            onClick={() => onNavigate(Screen.FinancialGoals)}
            className="bg-primary/10 text-primary font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary/20 transition-colors"
          >
            Set Your First Goal
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => onNavigate(Screen.Game)} className="bg-card p-4 rounded-2xl shadow-card flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all">
            <h2 className="font-bold text-primary mb-2">Pirate's Legacy</h2>
            <PirateIcon className="w-16 h-16 text-amber-700"/>
            <p className="text-sm text-secondary mt-2">Discover your island's treasure!</p>
        </div>
        <div className="bg-card p-4 rounded-2xl shadow-card flex flex-col items-center justify-center text-center">
             <h2 className="font-bold text-primary">Daily Streak</h2>
             <p className="text-6xl font-bold text-accent my-2">{streak}</p>
             <p className="font-semibold text-accent-dark">🔥 Day Streak!</p>
        </div>
      </div>
      
      <div onClick={() => onNavigate(Screen.SpendingCheck)} className="bg-card p-5 rounded-2xl shadow-card flex items-center gap-4 cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all">
        <NudgeIcon className="w-10 h-10 text-accent flex-shrink-0"/>
        <div>
            <h2 className="font-bold text-primary text-lg">Mindful Spend Check</h2>
            <p className="text-sm text-secondary">Get a quick AI insight before you buy.</p>
        </div>
      </div>
       
      <div className="bg-card p-5 rounded-2xl shadow-card">
        <h3 className="font-bold text-lg text-primary mb-2">Monthly Savings Goal</h3>
        {savingsGoalMet ? (
            <div className="text-center py-4">
                <p className="text-2xl mb-2">🎉</p>
                <h4 className="font-bold text-accent-dark">Goal Achieved!</h4>
                <p className="text-secondary text-sm">Congratulations! Time for a well-deserved treat.</p>
            </div>
        ) : (
            <>
                 <div className="flex justify-between items-baseline mb-1">
                    <p className="text-sm text-secondary font-semibold">Progress</p>
                    <p className="text-sm text-primary font-bold">{currencySymbol}{totalSaved.toFixed(0)} / <span className="text-secondary">{currencySymbol}{savingsTarget.amount}</span></p>
                </div>
                <div className="w-full bg-background rounded-full h-4">
                    <div className="bg-accent h-4 rounded-full transition-all duration-500" style={{ width: `${savingsProgress}%` }}></div>
                </div>
            </>
        )}
      </div>
      
      {weeklyInsight && (
        <div className="bg-card p-5 rounded-2xl shadow-card">
          <h3 className="font-bold text-lg text-primary flex items-center gap-2">
            Weekly SMS Roundup
          </h3>
          <p className="text-secondary text-md mt-2 italic">"{weeklyInsight}"</p>
          <p className="text-xs text-right text-gray-400 mt-2">via LifeLens SMS</p>
        </div>
      )}

      <div id="tutorial-log-activity-grid">
        <h2 className="text-xl font-bold text-primary mb-4">Log Your Activity</h2>
        <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onNavigate(Screen.AddIncome)} className="flex flex-col items-center justify-center bg-card p-3 rounded-2xl shadow-card transition-transform transform hover:scale-105">
                <IncomeIcon className="w-8 h-8 text-green-500"/>
                <span className="font-semibold text-xs mt-2">Income</span>
            </button>
            <button onClick={() => onNavigate(Screen.AddExpense)} className="flex flex-col items-center justify-center bg-card p-3 rounded-2xl shadow-card transition-transform transform hover:scale-105">
                <PlusIcon className="w-8 h-8 text-primary"/>
                <span className="font-semibold text-xs mt-2">Expense</span>
            </button>
            <button onClick={() => onNavigate(Screen.InnerCompass)} className="flex flex-col items-center justify-center bg-card p-3 rounded-2xl shadow-card transition-transform transform hover:scale-105">
                <PlusIcon className="w-8 h-8 text-accent"/>
                <span className="font-semibold text-xs mt-2">Mood</span>
            </button>
            <button onClick={() => onNavigate(Screen.Notes)} className="flex flex-col items-center justify-center bg-card p-3 rounded-2xl shadow-card transition-transform transform hover:scale-105">
                <PlusIcon className="w-8 h-8 text-secondary"/>
                <span className="font-semibold text-xs mt-2">Note</span>
            </button>
             <button onClick={() => onNavigate(Screen.SmsImport)} className="col-span-2 flex flex-col items-center justify-center bg-card p-3 rounded-2xl shadow-card transition-transform transform hover:scale-105">
                <SmsIcon className="w-8 h-8 text-blue-500"/>
                <span className="font-semibold text-xs mt-2">Import SMS</span>
            </button>
        </div>
      </div>
      
       <div className="space-y-4 pb-16">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Recent Expenses</h3>
            <div className="space-y-3">
              {expenses.slice(-3).reverse().map(expense => (
                <div key={expense.id} className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{expense.category}</p>
                    <p className="text-sm text-secondary">{expense.occasion}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-bold text-lg text-primary">{currencySymbol}{expense.amount.toFixed(2)}</p>
                    <button onClick={() => onEditExpense(expense.id)} className="text-secondary hover:text-primary" aria-label={`Edit expense for ${expense.category}`}>
                        <EditIcon className="w-5 h-5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card p-5 rounded-2xl shadow-card cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all" onClick={() => onNavigate(Screen.InnerCompass)}>
            <h3 className="font-bold text-lg text-primary">Unlock Your Insights</h3>
            <p className="text-secondary text-sm">Discover your secret patterns.</p>
          </div>
      </div>
    </div>
  );
};

export default HomeScreen;