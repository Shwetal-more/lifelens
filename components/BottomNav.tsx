import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

// Reusable Icon components
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const CompassRoseIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
);

const GoalsIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.278-.659 2.003-.659.768 0 1.536.219 2.121.659L15 9.182" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.278-.659 2.003-.659.768 0 1.536.219 2.121.659L15 9.182" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12.375a9 9 0 1 1 16.5 0v3.375A3.375 3.375 0 0 1 17.625 19.5H6.375A3.375 3.375 0 0 1 3 15.75V12.375Z" />
    </svg>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const IslandIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c-4.64 0-8.52-3.15-8.94-7.36.01-.05.02-.1.02-.16a9 9 0 0 1 17.84 0c0 .06-.01.11-.02.16-0.42 4.21-4.3 7.36-8.94 7.36Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.25 3.75a.75.75 0 0 0-1.5 0v3.018a1.5 1.5 0 0 0 .5 1.06l1.25 1.25a.75.75 0 0 0 1.06 0l1.25-1.25a1.5 1.5 0 0 0 .5-1.06V3.75a.75.75 0 0 0-.75-.75h-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.25 5.25a.75.75 0 0 0-1.5 0v2.268a1.5 1.5 0 0 0 .5 1.06l1.25 1.25a.75.75 0 0 0 1.06 0l1.25-1.25a1.5 1.5 0 0 0 .5-1.06V5.25a.75.75 0 0 0-.75-.75h-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.25 5.25a.75.75 0 0 0-1.5 0v2.268a1.5 1.5 0 0 0 .5 1.06l1.25 1.25a.75.75 0 0 0 1.06 0l1.25-1.25a1.5 1.5 0 0 0 .5-1.06V5.25a.75.75 0 0 0-.75-.75h-.75Z" />
    </svg>
);


const NavItem: React.FC<{
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  tutorialId?: string;
}> = ({ screen, label, icon, activeScreen, onNavigate, tutorialId }) => {
  const isActive = activeScreen === screen;
  return (
    <button
      id={tutorialId}
      onClick={() => onNavigate(screen)}
      className={`flex flex-col items-center justify-center w-16 h-16 transition-all duration-300 rounded-2xl ${isActive ? 'text-accent' : 'text-secondary hover:text-primary'}`}
    >
      <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-xs font-semibold mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-100'}`}>
        {label}
      </span>
    </button>
  );
};

const navItems = [
  { screen: Screen.Home, label: 'Home', icon: <HomeIcon className="w-6 h-6" />, tutorialId: 'tutorial-nav-home' },
  { screen: Screen.InnerCompass, label: 'Compass', icon: <CompassRoseIcon className="w-6 h-6" />, tutorialId: 'tutorial-nav-compass' },
  { screen: Screen.Game, label: 'Island', icon: <IslandIcon className="w-6 h-6" />, tutorialId: 'tutorial-nav-island' },
  { screen: Screen.FinancialGoals, label: 'Goals', icon: <GoalsIcon className="w-6 h-6" />, tutorialId: 'tutorial-nav-goals' },
  { screen: Screen.Profile, label: 'Profile', icon: <ProfileIcon className="w-6 h-6" />, tutorialId: 'tutorial-nav-profile' },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-light-shadow z-50">
        <div className="max-w-2xl mx-auto flex justify-around p-1">
            {navItems.map(item => (
                <NavItem key={item.screen} {...item} activeScreen={activeScreen} onNavigate={onNavigate} />
            ))}
        </div>
    </nav>
  );
};

export default BottomNav;