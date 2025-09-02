import React from 'react';
import { Expense, MoodEntry, Screen, UserProfile } from '../types';
import WellnessPlant from '../components/WellnessPlant';

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
  moods: MoodEntry[];
  onNavigate: (screen: Screen) => void;
  onEditExpense: (id: string) => void;
  streak: number;
  challenge: string;
  growthScore: number;
  showConfetti: boolean;
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

const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ userProfile, expenses, onNavigate, onEditExpense, streak, challenge, growthScore, showConfetti }) => {
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';
  
  return (
    <div className="p-4 space-y-8 relative">
      {showConfetti && <Confetti />}
      <header className="pt-4">
        <p className="text-secondary text-lg">Hello, {userProfile?.name || 'Explorer'}!</p>
        <h1 className="text-3xl font-bold text-primary">Ready for today's journey?</h1>
      </header>
      
      <div className="bg-card p-5 rounded-2xl shadow-card text-center">
        <h2 className="font-bold text-lg text-primary mb-2">Today's Challenge</h2>
        <p className="font-semibold text-secondary text-lg italic">"{challenge}"</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-2xl shadow-card flex flex-col items-center justify-center text-center">
            <h2 className="font-bold text-primary mb-2">Your Progress</h2>
            <WellnessPlant growthScore={growthScore} />
            <p className="text-sm text-secondary mt-2">Keep growing!</p>
        </div>
        <div className="bg-card p-4 rounded-2xl shadow-card flex flex-col items-center justify-center text-center">
             <h2 className="font-bold text-primary">Daily Streak</h2>
             <p className="text-6xl font-bold text-accent my-2">{streak}</p>
             <p className="font-semibold text-accent-dark">🔥 Day Streak!</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-primary mb-4">Log Your Activity</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
            <button onClick={() => onNavigate(Screen.AddExpense)} className="flex flex-col items-center justify-center bg-card p-4 rounded-2xl shadow-card hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <PlusIcon className="w-8 h-8 text-primary"/>
                <span className="font-semibold text-sm mt-2">Expense</span>
            </button>
            <button onClick={() => onNavigate(Screen.MoodTracker)} className="flex flex-col items-center justify-center bg-card p-4 rounded-2xl shadow-card hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <PlusIcon className="w-8 h-8 text-accent"/>
                <span className="font-semibold text-sm mt-2">Mood</span>
            </button>
            <button onClick={() => onNavigate(Screen.Notes)} className="flex flex-col items-center justify-center bg-card p-4 rounded-2xl shadow-card hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <PlusIcon className="w-8 h-8 text-secondary"/>
                <span className="font-semibold text-sm mt-2">Note</span>
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
                    <button onClick={() => onEditExpense(expense.id)} className="text-secondary hover:text-primary">
                        <EditIcon className="w-5 h-5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card p-5 rounded-2xl shadow-card cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all" onClick={() => onNavigate(Screen.Insights)}>
            <h3 className="font-bold text-lg text-primary">Unlock Your Insights</h3>
            <p className="text-secondary text-sm">Discover your secret patterns.</p>
          </div>
          <div className="bg-card p-5 rounded-2xl shadow-card cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all" onClick={() => onNavigate(Screen.FutureMe)}>
            <h3 className="font-bold text-lg text-primary">Future Me Time Capsule</h3>
            <p className="text-secondary text-sm">Send a message to your future self.</p>
          </div>
      </div>
    </div>
  );
};

export default HomeScreen;