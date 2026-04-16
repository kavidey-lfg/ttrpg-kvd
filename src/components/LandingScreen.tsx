import React from 'react';
import { TerminalSquare, Plus, FolderOpen, Clock, Trash2 } from 'lucide-react';
import { SaveGame } from '../types';

interface LandingScreenProps {
  step: 'landing' | 'load';
  setStep: (step: any) => void;
  savedGames: SaveGame[];
  handleLoadGame: (save: SaveGame) => void;
  deleteSave: (id: string, e: React.MouseEvent) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ 
  step, 
  setStep, 
  savedGames, 
  handleLoadGame, 
  deleteSave 
}) => {
  return (
    <div className="min-h-screen bg-[#070708] bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#070708_100%)] text-[#e2e2e7] flex flex-col items-center justify-center p-4 font-sans overflow-y-auto">
      <div className="max-w-2xl w-full space-y-8 py-12">
        <div className="text-center space-y-4">
          <TerminalSquare className="w-16 h-16 mx-auto text-[#ff9d00]" />
          <h1 className="text-4xl font-bold tracking-tighter uppercase text-[#ff9d00] font-mono border-b-2 border-[#ff9d00] pb-2 inline-block">VirtualGM</h1>
          <p className="text-[#888891] text-sm tracking-widest uppercase mt-2">Solo Tabletop RPG Engine</p>
        </div>
        
        {step === 'landing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setStep('genre')}
              className="group bg-[rgba(20,20,25,0.85)] p-8 border border-[#7a4d00] backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#ff9d00] transition-all flex flex-col items-center gap-4"
            >
              <Plus className="w-12 h-12 text-[#ff9d00] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-mono font-bold uppercase text-[#ff9d00]">New Campaign</span>
              <p className="text-xs text-[#888891] text-center uppercase tracking-wider">Start a fresh adventure in any genre</p>
            </button>
            
            <button 
              onClick={() => setStep('load')}
              className="group bg-[rgba(20,20,25,0.85)] p-8 border border-[#7a4d00] backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#ff9d00] transition-all flex flex-col items-center gap-4"
            >
              <FolderOpen className="w-12 h-12 text-[#ff9d00] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-mono font-bold uppercase text-[#ff9d00]">Load Game</span>
              <p className="text-xs text-[#888891] text-center uppercase tracking-wider">Continue your existing journey</p>
            </button>
          </div>
        )}

        {step === 'load' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-mono font-bold uppercase text-[#ff9d00]">Saved Campaigns</h2>
              <button onClick={() => setStep('landing')} className="text-xs text-[#888891] hover:text-[#ff9d00] uppercase tracking-widest">Back</button>
            </div>
            
            {savedGames.length === 0 ? (
              <div className="bg-[rgba(20,20,25,0.85)] p-12 border border-[#7a4d00] text-center">
                <p className="text-[#888891] uppercase tracking-widest">No saved games found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedGames.map(save => (
                  <div 
                    key={save.id}
                    onClick={() => handleLoadGame(save)}
                    className="group bg-[rgba(20,20,25,0.85)] p-6 border border-[#7a4d00] hover:border-[#ff9d00] transition-all cursor-pointer flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <h3 className="text-lg font-mono font-bold text-[#ff9d00] uppercase">{save.title}</h3>
                      <div className="flex gap-4 text-[0.6rem] text-[#888891] uppercase tracking-widest">
                        <span>Genre: {save.genre}</span>
                        <span>Character: {save.charName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[0.6rem] text-[#444]">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(save.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteSave(save.id, e)}
                      className="p-2 text-[#444] hover:text-[#ff4444] transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
