import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { Send, Shield, Coins, Backpack, TerminalSquare, Loader2, Menu, X, User } from 'lucide-react';

const SYSTEM_PROMPT = `You are the "VirtualGM," an advanced, strict, and impartial Game Master for a solo tabletop role-playing game. You adapt to the genre provided by the user (e.g., High Fantasy, Cyberpunk). 

Your job is to vividly describe the world, control NPCs, and enforce the rules of the game. You must never make decisions for the player's character. 

### CORE RULES OF ENGAGEMENT
1. **The Call and Response Loop:** You must advance the narrative based on the player's actions. Describe the environment, present a hook or an obstacle, and STOP. Always end your narrative by asking: "What do you do?"
2. **Skill Checks:** If a player attempts an action with a chance of failure, do not immediately resolve it. Pause the narrative and demand a skill check (e.g., "Roll a 1d20 for Stealth"). Wait for the player to provide the result before describing the outcome.
3. **Impartiality:** Characters can die. If a player makes a poor tactical decision or fails a critical roll, inflict appropriate consequences (damage, loss of items, or narrative setbacks).

### REQUIRED OUTPUT FORMAT
To allow the game's front-end interface to update the player's character sheet, you must separate your mechanical commands from your narrative text. 

If an event changes the player's stats, you MUST append a "SYSTEM BLOCK" at the absolute end of your response using this exact JSON format. If no stats change, omit the system block entirely.

**Example Response:**
The corporate guard spots you sliding past the server rack. He unholsters his sidearm and fires. The laser grazes your shoulder, burning through your jacket. You take 4 damage. The alarm begins to blare. What do you do?

\`\`\`json
{
  "SYSTEM_UPDATE": {
    "hp_change": -4,
    "currency_change": 0,
    "stats_change": {
      "STR": 0,
      "DEX": 0,
      "INT": 0,
      "CHA": 0
    },
    "inventory_add": [],
    "inventory_remove": []
  }
}
\`\`\``;

type Message = {
  role: 'user' | 'model';
  text: string;
};

type SystemUpdate = {
  hp_change?: number;
  currency_change?: number;
  stats_change?: Record<string, number>;
  inventory_add?: string[];
  inventory_remove?: string[];
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [genre, setGenre] = useState('');
  const [step, setStep] = useState<'genre' | 'character' | 'game'>('genre');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseSystemUpdate = (text: string): { update: SystemUpdate | null; cleanText: string; rawJson: string | null } => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    if (match) {
      try {
        const json = JSON.parse(match[1]);
        if (json.SYSTEM_UPDATE) {
          return {
            update: json.SYSTEM_UPDATE,
            cleanText: text.replace(jsonRegex, '').trim(),
            rawJson: match[1]
          };
        }
      } catch (e) {
        console.error("Failed to parse JSON", e);
      }
    }
    return { update: null, cleanText: text, rawJson: null };
  };

  const applySystemUpdate = (update: SystemUpdate) => {
    if (update.hp_change !== undefined && update.hp_change !== 0) {
      setHp(prev => Math.max(0, prev + update.hp_change!));
    }
    if (update.currency_change !== undefined && update.currency_change !== 0) {
      setCurrency(prev => Math.max(0, prev + update.currency_change!));
    }
    if (update.stats_change) {
      setStats(prev => {
        const newStats = { ...prev };
        Object.entries(update.stats_change!).forEach(([key, value]) => {
          newStats[key] = (newStats[key] || 10) + value;
        });
        return newStats;
      });
    }
    if (update.inventory_add && update.inventory_add.length > 0) {
      setInventory(prev => [...prev, ...update.inventory_add!]);
    }
    if (update.inventory_remove && update.inventory_remove.length > 0) {
      setInventory(prev => prev.filter(item => !update.inventory_remove!.includes(item)));
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
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

  if (step !== 'game') {
    return (
      <div className="min-h-screen bg-[#070708] bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#070708_100%)] text-[#e2e2e7] flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <TerminalSquare className="w-16 h-16 mx-auto text-[#ff9d00]" />
            <h1 className="text-4xl font-bold tracking-tighter uppercase text-[#ff9d00] font-mono border-b-2 border-[#ff9d00] pb-2 inline-block">VirtualGM</h1>
            <p className="text-[#888891] text-sm tracking-widest uppercase mt-2">Solo Tabletop RPG Engine</p>
          </div>
          
          {step === 'genre' ? (
            <form onSubmit={handleGenreSubmit} className="space-y-6 bg-[rgba(20,20,25,0.85)] p-8 border border-[#7a4d00] backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
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
              <button
                type="submit"
                className="w-full bg-[#ff9d00] hover:bg-[#cc7e00] text-[#070708] font-bold uppercase tracking-widest py-3 transition-colors flex items-center justify-center gap-2"
              >
                Next: Character Creation
              </button>
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
  }

  return (
    <div className="h-screen bg-[#070708] bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#070708_100%)] text-[#e2e2e7] flex flex-col font-sans overflow-hidden relative">
      
      {/* Global Navbar */}
      <nav className="sticky top-0 bg-[rgba(20,20,25,0.95)] border-b border-[#7a4d00] p-4 flex items-center justify-between z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <TerminalSquare className="w-6 h-6 text-[#ff9d00]" />
          <span className="font-mono text-[#ff9d00] font-bold uppercase tracking-wider text-sm">VirtualGM</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[#ff9d00] p-1 md:hidden"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </button>
          <div className="hidden md:flex items-center gap-2 text-[0.7rem] text-[#888891] uppercase tracking-[1px]">
            <span>{genre} // Campaign</span>
            <span className="text-[#7a4d00]">|</span>
            <span className="text-[#ff9d00] font-mono">{charName}</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Character Sheet Panel (Sidebar) */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-[280px] md:w-[300px] bg-[rgba(20,20,25,0.95)] border-r border-[#7a4d00] flex flex-col p-6 backdrop-blur-lg shadow-[10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:bg-[rgba(20,20,25,0.85)]
        `}>
          <div className="mb-10 flex justify-between items-start">
            <div>
              <div className="font-mono text-[#ff9d00] font-bold tracking-[2px] text-xl uppercase border-b-2 border-[#ff9d00] pb-2 inline-block">Character</div>
              <div className="text-[0.7rem] text-[#888891] mt-1 uppercase tracking-[1px]">{charName}</div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-[#888891] hover:text-[#ff9d00]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        
        <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
        
        <div className="mt-auto pt-6 text-[0.6rem] text-[#444] font-mono leading-relaxed border-t border-[#2A2B2E]">
          SECURE_CONNECTION_STABLE<br/>
          ENCRYPTION_AES_256<br/>
          GMT_OFFSET_+00:00
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-[60px_80px] flex flex-col">
          <div className="mt-auto space-y-8 pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' ? (
                  <div className="text-[1.1rem] md:text-[1.4rem] leading-[1.6] text-[#e2e2e7] italic border-l-2 border-[#ff9d00] pl-4 md:pl-6 mb-4 w-full">
                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#000] prose-pre:border prose-pre:border-[#333] max-w-none prose-sm md:prose-base">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[90%] md:max-w-[75%] p-3 md:p-4 border border-[#7a4d00] bg-[rgba(255,157,0,0.05)] text-[#ff9d00] font-mono text-xs md:text-sm">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="text-[1.1rem] md:text-[1.4rem] leading-[1.6] text-[#e2e2e7] italic border-l-2 border-[#ff9d00] pl-4 md:pl-6 mb-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#ff9d00]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#888891]">Processing...</span>
                </div>
              </div>
            )}
            
            {/* GM Prompt Pulse */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'model' && (
              <div className="font-mono text-[#ff9d00] text-sm md:text-[1.2rem] uppercase tracking-[2px] animate-[pulse_2s_infinite_ease-in-out] mt-4">
                What do you do?
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* System Footer / Input Area */}
        <div className="bg-[rgba(0,0,0,0.6)] border-t border-[#7a4d00] p-4 md:p-[20px_40px] flex flex-col md:flex-row gap-4 md:gap-5 backdrop-blur-md">
          <div className="w-full md:w-[400px] flex flex-col justify-center">
            <div className="text-[0.6rem] md:text-[0.7rem] text-[#888891] mb-[5px] uppercase">Awaiting Command</div>
            <form onSubmit={sendMessage} className="flex w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter action..."
                disabled={isLoading}
                className="flex-1 bg-transparent border border-[#ff9d00] p-3 md:p-[15px] text-[#ff9d00] font-mono text-sm outline-none shadow-[inset_0_0_5px_#7a4d00] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#ff9d00] hover:bg-[#cc7e00] disabled:bg-[#7a4d00] disabled:text-[#888891] text-[#070708] px-4 transition-colors flex items-center justify-center border border-[#ff9d00]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          <div className="flex-1 bg-[#000] border border-[#333] p-[10px] md:p-[15px] font-mono text-[0.7rem] md:text-[0.8rem] text-[#00ff41] overflow-hidden hidden sm:flex flex-col max-h-[100px] md:max-h-none">
            <div className="text-[#555] text-[0.6rem] md:text-[0.65rem] uppercase mb-[5px] md:mb-[10px]">System Log</div>
            <div className="overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {lastSystemUpdate ? (
                <pre className="text-[0.6rem] md:text-[0.8rem]">{`{\n  "SYSTEM_UPDATE": ${lastSystemUpdate}\n}`}</pre>
              ) : (
                `> SYSTEM_IDLE\n> READY`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}


