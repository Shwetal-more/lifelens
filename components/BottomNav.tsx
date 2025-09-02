import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const MoodIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 9.75h.008v.008H9V9.75Zm6 0h.008v.008H15V9.75Z" />
  </svg>
);

const NotesIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const InsightsIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
  </svg>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const NavItem: React.FC<{
  screen: Screen;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  Icon: React.ElementType;
  label: string;
}> = ({ screen, activeScreen, onNavigate, Icon, label }) => {
  const isActive = activeScreen === screen;
  const color = isActive ? 'text-accent' : 'text-secondary hover:text-primary';

  return (
    <button onClick={() => onNavigate(screen)} className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${color}`}>
      <Icon className="w-6 h-6 mb-1" />
      <span className={`text-xs font-semibold transition-all ${isActive ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-card/80 backdrop-blur-sm rounded-2xl shadow-card">
      <div className="flex justify-around items-center h-20">
        <NavItem screen={Screen.Home} activeScreen={activeScreen} onNavigate={onNavigate} Icon={HomeIcon} label="Home" />
        <NavItem screen={Screen.MoodTracker} activeScreen={activeScreen} onNavigate={onNavigate} Icon={MoodIcon} label="Mood" />
        <NavItem screen={Screen.Notes} activeScreen={activeScreen} onNavigate={onNavigate} Icon={NotesIcon} label="Notes" />
        <NavItem screen={Screen.Insights} activeScreen={activeScreen} onNavigate={onNavigate} Icon={InsightsIcon} label="Insights" />
        <NavItem screen={Screen.Profile} activeScreen={activeScreen} onNavigate={onNavigate} Icon={ProfileIcon} label="Profile" />
      </div>
    </nav>
  );
};

export default BottomNav;