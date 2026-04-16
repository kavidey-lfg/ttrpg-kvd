import React from 'react';
import { TerminalSquare, Loader2 } from 'lucide-react';

interface SetupScreenProps {
  step: 'genre' | 'character';
  setStep: (step: any) => void;
  campaignTitle: string;
  setCampaignTitle: (val: string) => void;
  genre: string;
  setGenre: (val: string) => void;
  charName: string;
  setCharName: (val: string) => void;
  charAppearance: string;
  setCharAppearance: (val: string) => void;
  charSkills: string;
  setCharSkills: (val: string) => void;
  handleGenreSubmit: (e: React.FormEvent) => void;
  initializeCampaign: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  step,
  setStep,
  campaignTitle,
  setCampaignTitle,
  genre,
  setGenre,
  charName,
  setCharName,
  charAppearance,
  setCharAppearance,
  charSkills,
  setCharSkills,
  handleGenreSubmit,
  initializeCampaign,
  isLoading
}) => {
  return (
    <div className="min-h-screen bg-[#070708] bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#070708_100%)] text-[#e2e2e7] flex flex-col items-center justify-center p-4 font-sans overflow-y-auto">
      <div className="max-w-2xl w-full space-y-8 py-12">
        <div className="text-center space-y-4">
          <TerminalSquare className="w-16 h-16 mx-auto text-[#ff9d00]" />
          <h1 className="text-4xl font-bold tracking-tighter uppercase text-[#ff9d00] font-mono border-b-2 border-[#ff9d00] pb-2 inline-block">VirtualGM</h1>
          <p className="text-[#888891] text-sm tracking-widest uppercase mt-2">Solo Tabletop RPG Engine</p>
        </div>

        {step === 'genre' ? (
          <form onSubmit={handleGenreSubmit} className="space-y-6 bg-[rgba(20,20,25,0.85)] p-8 border border-[#7a4d00] backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-xs font-bold tracking-widest uppercase text-[#888891]">
                  Campaign Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="Enter a title for your adventure..."
                  className="w-full bg-transparent border border-[#ff9d00] p-4 text-[#ff9d00] font-mono focus:outline-none shadow-[inset_0_0_5px_#7a4d00] transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="genre" className="text-xs font-bold tracking-widest uppercase text-[#888891]">
                  Select Campaign Genre
                </label>
                <input
                  id="genre"
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Cyberpunk, High Fantasy, Sci-Fi..."
                  className="w-full bg-transparent border border-[#ff9d00] p-4 text-[#ff9d00] font-mono focus:outline-none shadow-[inset_0_0_5px_#7a4d00] transition-colors"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('landing')}
                className="flex-1 border border-[#7a4d00] text-[#888891] hover:text-[#e2e2e7] font-bold uppercase tracking-widest py-3 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-[2] bg-[#ff9d00] hover:bg-[#cc7e00] text-[#070708] font-bold uppercase tracking-widest py-3 transition-colors flex items-center justify-center gap-2"
              >
                Next: Character Creation
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={initializeCampaign} className="space-y-6 bg-[rgba(20,20,25,0.85)] p-8 border border-[#7a4d00] backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold tracking-widest uppercase text-[#888891]">
                  Character Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-transparent border border-[#ff9d00] p-3 text-[#ff9d00] font-mono focus:outline-none shadow-[inset_0_0_5px_#7a4d00] transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="appearance" className="text-xs font-bold tracking-widest uppercase text-[#888891]">
                  Appearance
                </label>
                <textarea
                  id="appearance"
                  value={charAppearance}
                  onChange={(e) => setCharAppearance(e.target.value)}
                  placeholder="Describe your look..."
                  className="w-full bg-transparent border border-[#ff9d00] p-3 text-[#ff9d00] font-mono focus:outline-none shadow-[inset_0_0_5px_#7a4d00] transition-colors h-20 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="skills" className="text-xs font-bold tracking-widest uppercase text-[#888891]">
                  Starting Skills
                </label>
                <input
                  id="skills"
                  type="text"
                  value={charSkills}
                  onChange={(e) => setCharSkills(e.target.value)}
                  placeholder="e.g., Hacking, Swordsmanship..."
                  className="w-full bg-transparent border border-[#ff9d00] p-3 text-[#ff9d00] font-mono focus:outline-none shadow-[inset_0_0_5px_#7a4d00] transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('genre')}
                className="flex-1 border border-[#7a4d00] text-[#888891] hover:text-[#e2e2e7] font-bold uppercase tracking-widest py-3 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-[2] bg-[#ff9d00] hover:bg-[#cc7e00] text-[#070708] font-bold uppercase tracking-widest py-3 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Begin Adventure'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
