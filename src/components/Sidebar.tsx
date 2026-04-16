import React from 'react';
import { User, BookText, X, Plus, Check, Edit3, Trash } from 'lucide-react';
import { JournalEntry } from '../types';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  activeTab: 'character' | 'journal';
  setActiveTab: (val: 'character' | 'journal') => void;
  charName: string;
  hp: number;
  currency: number;
  stats: Record<string, number>;
  inventory: string[];
  journal: JournalEntry[];
  isAddingEntry: boolean;
  setIsAddingEntry: (val: boolean) => void;
  editingEntryId: string | null;
  setEditingEntryId: (val: string | null) => void;
  entryTitle: string;
  setEntryTitle: (val: string) => void;
  entryContent: string;
  setEntryContent: (val: string) => void;
  handleAddJournalEntry: () => void;
  handleUpdateJournalEntry: () => void;
  startEditingEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  charName,
  hp,
  currency,
  stats,
  inventory,
  journal,
  isAddingEntry,
  setIsAddingEntry,
  editingEntryId,
  setEditingEntryId,
  entryTitle,
  setEntryTitle,
  entryContent,
  setEntryContent,
  handleAddJournalEntry,
  handleUpdateJournalEntry,
  startEditingEntry,
  deleteJournalEntry
}) => {
  return (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-[280px] md:w-[320px] bg-[rgba(20,20,25,0.95)] border-r border-[#7a4d00] flex flex-col backdrop-blur-lg shadow-[10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 md:bg-[rgba(20,20,25,0.85)]
    `}>
      {/* Sidebar Header / Tabs */}
      <div className="flex border-b border-[#7a4d00]">
        <button 
          onClick={() => setActiveTab('character')}
          className={`flex-1 p-4 font-mono text-[0.7rem] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'character' ? 'bg-[#ff9d00] text-[#070708] font-bold' : 'text-[#888891] hover:text-[#ff9d00]'}`}
        >
          <User className="w-4 h-4" />
          Stats
        </button>
        <button 
          onClick={() => setActiveTab('journal')}
          className={`flex-1 p-4 font-mono text-[0.7rem] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'journal' ? 'bg-[#ff9d00] text-[#070708] font-bold' : 'text-[#888891] hover:text-[#ff9d00]'}`}
        >
          <BookText className="w-4 h-4" />
          Journal
        </button>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-4 text-[#888891] hover:text-[#ff9d00] border-l border-[#7a4d00]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'character' ? (
          <div className="space-y-8">
            <div className="mb-4">
              <div className="font-mono text-[#ff9d00] font-bold tracking-[2px] text-xl uppercase border-b-2 border-[#ff9d00] pb-2 inline-block">Character</div>
              <div className="text-[0.7rem] text-[#888891] mt-1 uppercase tracking-[1px]">{charName}</div>
            </div>
          
            {/* Stats Block */}
            <div className="space-y-6">
              {/* HP */}
              <div>
                <div className="flex justify-between text-[0.8rem] text-[#888891] uppercase mb-2">
                  <span>Vitals (HP)</span>
                  <span>{hp} / 20</span>
                </div>
                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-[#ff4444] shadow-[0_0_10px_#ff4444] transition-all duration-500" 
                    style={{ width: `${Math.min(100, (hp / 20) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Currency */}
              <div>
                <div className="flex justify-between text-[0.8rem] text-[#888891] uppercase mb-2">
                  <span>Credits</span>
                  <span>{currency} ¤</span>
                </div>
                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-[#ff9d00] shadow-[0_0_10px_#ff9d00] transition-all duration-500" 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-3 pt-4 border-t border-[#2A2B2E]">
                <div className="text-[0.8rem] text-[#888891] uppercase mb-2">Attributes</div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="flex flex-col border border-[#7a4d00] bg-[rgba(255,157,0,0.05)] p-2">
                      <span className="text-[0.6rem] text-[#888891] uppercase">{key}</span>
                      <span className="text-lg font-mono text-[#ff9d00]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-2">
              <div className="text-[0.8rem] text-[#888891] uppercase mb-2">Inventory</div>
              {inventory.length === 0 ? (
                <p className="text-sm text-[#888891] italic">Empty</p>
              ) : (
                <ul className="list-none space-y-2">
                  {inventory.map((item, i) => (
                    <li key={i} className="text-[0.9rem] px-3 py-2 border border-[#7a4d00] bg-[rgba(255,157,0,0.05)] text-[#e2e2e7]">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="font-mono text-[#ff9d00] font-bold tracking-[2px] text-xl uppercase border-b-2 border-[#ff9d00] pb-2 inline-block">Journal</div>
              {!isAddingEntry && !editingEntryId && (
                <button 
                  onClick={() => { setIsAddingEntry(true); setEntryTitle(''); setEntryContent(''); }}
                  className="p-1 text-[#ff9d00] hover:bg-[#ff9d00] hover:text-[#070708] border border-[#ff9d00] transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {(isAddingEntry || editingEntryId) ? (
              <div className="space-y-4 bg-[rgba(255,157,0,0.05)] p-4 border border-[#7a4d00]">
                <div className="space-y-2">
                  <label className="text-[0.6rem] text-[#888891] uppercase">Entry Title</label>
                  <input 
                    type="text"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder="Lore, Quest, Note..."
                    className="w-full bg-transparent border border-[#7a4d00] p-2 text-[#ff9d00] font-mono text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.6rem] text-[#888891] uppercase">Content</label>
                  <textarea 
                    value={entryContent}
                    onChange={(e) => setEntryContent(e.target.value)}
                    placeholder="Record details here..."
                    className="w-full bg-transparent border border-[#7a4d00] p-2 text-[#e2e2e7] font-sans text-sm outline-none h-32 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={editingEntryId ? handleUpdateJournalEntry : handleAddJournalEntry}
                    className="flex-1 bg-[#ff9d00] text-[#070708] py-2 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingEntryId ? 'Update' : 'Save'}
                  </button>
                  <button 
                    onClick={() => { setIsAddingEntry(false); setEditingEntryId(null); }}
                    className="flex-1 border border-[#7a4d00] text-[#888891] py-2 font-mono text-xs uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {journal.length === 0 ? (
                  <p className="text-sm text-[#888891] italic text-center py-8">No entries yet. Record your journey.</p>
                ) : (
                  journal.map(entry => (
                    <div key={entry.id} className="group border border-[#2A2B2E] bg-[rgba(20,20,25,0.5)] p-4 space-y-2 hover:border-[#7a4d00] transition-all">
                      <div className="flex justify-between items-start">
                        <h4 className="text-[#ff9d00] font-mono text-sm uppercase font-bold">{entry.title}</h4>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditingEntry(entry)} className="text-[#888891] hover:text-[#ff9d00]">
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteJournalEntry(entry.id)} className="text-[#888891] hover:text-[#ff4444]">
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#e2e2e7] leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                      <div className="text-[0.5rem] text-[#444] uppercase tracking-widest pt-2">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-auto p-6 text-[0.6rem] text-[#444] font-mono leading-relaxed border-t border-[#2A2B2E]">
        SECURE_CONNECTION_STABLE<br/>
        ENCRYPTION_AES_256<br/>
        GMT_OFFSET_+00:00
      </div>
    </div>
  );
};
