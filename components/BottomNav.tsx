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
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125-1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375" />
    </svg>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const IslandIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664l.143.258a1.107 1.107 0 0 0 1.545.57l.114-.065a2.25 2.25 0 0 1 1.161.886l.51.766c.319.48.125 1.121-.317 1.49l-1.068.89a1.125 1.125 0 0 0-.405.864v.568m-6 0v-.568c0-.334-.148-.65-.405-.864l-1.068-.89c-.442-.369-.535-1.01-.216-1.49l.51-.766a2.25 2.25 0 0 1 1.161-.886l.143-.048a1.107 1.107 0 0 0 .57-1.664l-.143-.258a1.107 1.107 0 0 0-1.545-.57l-.114.065a2.25 2.25 0 0 1-1.161-.886l-.51-.766c-.319-.48-.125-1.121.317-1.49l1.068-.89a1.125 1.125 0 0 0 .405-.864v-.568m0 0a1.5 1.5 0 1 0 3 0m-3 0a1.5 1.5 0 1 1-3 0m0 0a1.5 1.5 0 1 0 3 0m-3 0a1.5 1.5 0 1 1-3 0" />
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