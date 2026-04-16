import React from 'react';
import { TerminalSquare, Save, X, User } from 'lucide-react';

interface NavbarProps {
  handleSaveGame: () => void;
  setStep: (step: any) => void;
  setIsSidebarOpen: (val: boolean) => void;
  isSidebarOpen: boolean;
  campaignTitle: string;
  genre: string;
  charName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  handleSaveGame,
  setStep,
  setIsSidebarOpen,
  isSidebarOpen,
  campaignTitle,
  genre,
  charName
}) => {
  return (
    <nav className="sticky top-0 bg-[rgba(20,20,25,0.95)] border-b border-[#7a4d00] p-4 flex items-center justify-between z-50 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <TerminalSquare className="w-6 h-6 text-[#ff9d00]" />
        <span className="font-mono text-[#ff9d00] font-bold uppercase tracking-wider text-sm">VirtualGM</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleSaveGame}
          className="text-[#ff9d00] hover:text-[#cc7e00] p-1 flex items-center gap-2 border border-[#7a4d00] px-3 py-1 bg-[rgba(255,157,0,0.05)] transition-all"
          title="Save Game"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline text-[0.6rem] uppercase font-mono">Save</span>
        </button>
        <button 
          onClick={() => {
            if (confirm("Return to main menu? Unsaved progress will be lost.")) {
              setStep('landing');
            }
          }}
          className="text-[#888891] hover:text-[#ff9d00] p-1 flex items-center gap-2 border border-[#2A2B2E] px-3 py-1 transition-all"
          title="Main Menu"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline text-[0.6rem] uppercase font-mono">Exit</span>
        </button>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-[#ff9d00] p-1 md:hidden"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <User className="w-6 h-6" />}
        </button>
        <div className="hidden md:flex items-center gap-2 text-[0.7rem] text-[#888891] uppercase tracking-[1px]">
          <span>{campaignTitle || genre}</span>
          <span className="text-[#7a4d00]">|</span>
          <span className="text-[#ff9d00] font-mono">{charName}</span>
        </div>
      </div>
    </nav>
  );
};
