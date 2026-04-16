import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message, SystemUpdate, SaveGame, JournalEntry } from './types';
import { SYSTEM_PROMPT } from './constants';
import { parseSystemUpdate } from './lib/utils';
import { LandingScreen } from './components/LandingScreen';
import { SetupScreen } from './components/SetupScreen';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [genre, setGenre] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [step, setStep] = useState<'landing' | 'genre' | 'character' | 'game' | 'load'>('landing');
  const [activeTab, setActiveTab] = useState<'character' | 'journal'>('character');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedGames, setSavedGames] = useState<SaveGame[]>([]);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  
  // Journal State
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  
  // Character Details
  const [charName, setCharName] = useState('');
  const [charAppearance, setCharAppearance] = useState('');
  const [charSkills, setCharSkills] = useState('');

  // Character Stats
  const [hp, setHp] = useState(20);
  const [currency, setCurrency] = useState(100);
  const [stats, setStats] = useState<Record<string, number>>({
    STR: 10,
    DEX: 10,
    INT: 10,
    CHA: 10
  });
  const [inventory, setInventory] = useState<string[]>(['Rations', 'Basic Toolkit']);

  const [lastSystemUpdate, setLastSystemUpdate] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loaded = localStorage.getItem('virtualgm_saves');
    if (loaded) {
      try {
        setSavedGames(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to load saved games", e);
      }
    }
  }, []);

  const saveToLocalStorage = (saves: SaveGame[]) => {
    localStorage.setItem('virtualgm_saves', JSON.stringify(saves));
    setSavedGames(saves);
  };

  const handleSaveGame = () => {
    const newSave: SaveGame = {
      id: Date.now().toString(),
      title: campaignTitle || `${genre} Campaign`,
      genre,
      charName,
      charAppearance,
      charSkills,
      hp,
      currency,
      stats,
      inventory,
      messages,
      journal,
      lastSystemUpdate,
      timestamp: Date.now(),
    };

    const updatedSaves = [newSave, ...savedGames.filter(s => s.title !== newSave.title)];
    saveToLocalStorage(updatedSaves);
    alert("Game Saved Successfully!");
  };

  const handleLoadGame = (save: SaveGame) => {
    setCampaignTitle(save.title);
    setGenre(save.genre);
    setCharName(save.charName);
    setCharAppearance(save.charAppearance);
    setCharSkills(save.charSkills);
    setHp(save.hp);
    setCurrency(save.currency);
    setStats(save.stats);
    setInventory(save.inventory);
    setMessages(save.messages);
    setJournal(save.journal || []);
    setLastSystemUpdate(save.lastSystemUpdate);
    setStep('game');
  };

  const deleteSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedGames.filter(s => s.id !== id);
    saveToLocalStorage(updated);
  };

  const handleAddJournalEntry = () => {
    if (!entryTitle.trim()) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: entryTitle,
      content: entryContent,
      timestamp: Date.now(),
    };
    setJournal([newEntry, ...journal]);
    setEntryTitle('');
    setEntryContent('');
    setIsAddingEntry(false);
  };

  const handleUpdateJournalEntry = () => {
    if (!editingEntryId || !entryTitle.trim()) return;
    setJournal(journal.map(e => e.id === editingEntryId ? { ...e, title: entryTitle, content: entryContent } : e));
    setEditingEntryId(null);
    setEntryTitle('');
    setEntryContent('');
  };

  const startEditingEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEntryTitle(entry.title);
    setEntryContent(entry.content);
    setIsAddingEntry(false);
  };

  const deleteJournalEntry = (id: string) => {
    setJournal(journal.filter(e => e.id !== id));
  };

  const applySystemUpdate = (update: SystemUpdate) => {
    if (!update || typeof update !== 'object') return;

    // Reset choices for the new turn
    setCurrentChoices(update.choices || []);

    // Robust numeric conversion for changes
    if (update.hp_change !== undefined) {
      const val = Number(update.hp_change);
      if (!isNaN(val)) setHp(prev => Math.max(0, prev + val));
    }
    
    if (update.currency_change !== undefined) {
      const val = Number(update.currency_change);
      if (!isNaN(val)) setCurrency(prev => Math.max(0, prev + val));
    }

    if (update.stats_change && typeof update.stats_change === 'object') {
      setStats(prev => {
        const newStats = { ...prev };
        Object.entries(update.stats_change!).forEach(([key, value]) => {
          const val = Number(value);
          if (!isNaN(val)) {
            newStats[key] = (newStats[key] || 10) + val;
          }
        });
        return newStats;
      });
    }

    if (Array.isArray(update.inventory_add)) {
      const itemsToAdd = update.inventory_add.map(item => String(item).trim()).filter(Boolean);
      if (itemsToAdd.length > 0) {
        setInventory(prev => [...prev, ...itemsToAdd]);
      }
    }

    if (Array.isArray(update.inventory_remove)) {
      const itemsToRemove = update.inventory_remove.map(item => String(item).trim()).filter(Boolean);
      if (itemsToRemove.length > 0) {
        setInventory(prev => prev.filter(item => !itemsToRemove.includes(item)));
      }
    }
  };

  const handleGenreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genre.trim()) return;
    setStep('character');
  };

  const initializeCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim()) return;
    
    setStep('game');
    setIsLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Start a new solo tabletop RPG campaign in the ${genre} genre. 
      My character is named ${charName}. 
      Appearance: ${charAppearance || 'Not specified'}. 
      Starting Skills: ${charSkills || 'Standard for the genre'}.
      
      Introduce the setting, my character's starting situation based on these details, and present the first hook or obstacle. End by asking what I do.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        }
      });

      const text = response.text || '';
      const { update, cleanText, rawJson } = parseSystemUpdate(text);
      
      if (update) applySystemUpdate(update);
      if (rawJson) setLastSystemUpdate(rawJson);
      
      setMessages([{ role: 'model', text: cleanText }]);
    } catch (error) {
      console.error("Error starting game:", error);
      setMessages([{ role: 'model', text: "Error connecting to VirtualGM. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    if (isLoading) return;

    const userMessage = typeof e === 'string' ? e : input.trim();
    if (!userMessage) return;

    setInput('');
    setCurrentChoices([]); // Clear choices when player acts
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      // Build conversation history
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      // Add the new user message
      history.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: history,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        }
      });

      const text = response.text || '';
      const { update, cleanText, rawJson } = parseSystemUpdate(text);
      
      if (update) applySystemUpdate(update);
      if (rawJson) setLastSystemUpdate(rawJson);
      
      setMessages(prev => [...prev, { role: 'model', text: cleanText }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error communicating with VirtualGM." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'landing' || step === 'load') {
    return (
      <LandingScreen 
        step={step}
        setStep={setStep}
        savedGames={savedGames}
        handleLoadGame={handleLoadGame}
        deleteSave={deleteSave}
      />
    );
  }

  if (step === 'genre' || step === 'character') {
    return (
      <SetupScreen 
        step={step}
        setStep={setStep}
        campaignTitle={campaignTitle}
        setCampaignTitle={setCampaignTitle}
        genre={genre}
        setGenre={setGenre}
        charName={charName}
        setCharName={setCharName}
        charAppearance={charAppearance}
        setCharAppearance={setCharAppearance}
        charSkills={charSkills}
        setCharSkills={setCharSkills}
        handleGenreSubmit={handleGenreSubmit}
        initializeCampaign={initializeCampaign}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="h-screen bg-[#070708] bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#070708_100%)] text-[#e2e2e7] flex flex-col font-sans overflow-hidden relative">
      <Navbar 
        handleSaveGame={handleSaveGame}
        setStep={setStep}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        campaignTitle={campaignTitle}
        genre={genre}
        charName={charName}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          charName={charName}
          hp={hp}
          currency={currency}
          stats={stats}
          inventory={inventory}
          journal={journal}
          isAddingEntry={isAddingEntry}
          setIsAddingEntry={setIsAddingEntry}
          editingEntryId={editingEntryId}
          setEditingEntryId={setEditingEntryId}
          entryTitle={entryTitle}
          setEntryTitle={setEntryTitle}
          entryContent={entryContent}
          setEntryContent={setEntryContent}
          handleAddJournalEntry={handleAddJournalEntry}
          handleUpdateJournalEntry={handleUpdateJournalEntry}
          startEditingEntry={startEditingEntry}
          deleteJournalEntry={deleteJournalEntry}
        />

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <ChatArea 
          messages={messages}
          isLoading={isLoading}
          currentChoices={currentChoices}
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          lastSystemUpdate={lastSystemUpdate}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
}
