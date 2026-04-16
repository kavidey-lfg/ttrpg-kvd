import React from 'react';
import Markdown from 'react-markdown';
import { Loader2, Send } from 'lucide-react';
import { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  currentChoices: string[];
  input: string;
  setInput: (val: string) => void;
  sendMessage: (e: React.FormEvent | string) => void;
  lastSystemUpdate: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  currentChoices,
  input,
  setInput,
  sendMessage,
  lastSystemUpdate,
  messagesEndRef
}) => {
  return (
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
            <div className="space-y-6 mt-4">
              {currentChoices.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentChoices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(choice)}
                      className="p-3 border border-[#ff9d00] bg-[rgba(255,157,0,0.05)] text-[#ff9d00] font-mono text-xs uppercase tracking-widest hover:bg-[#ff9d00] hover:text-[#070708] transition-all text-left flex items-center gap-3 group"
                    >
                      <span className="text-[#7a4d00] group-hover:text-[#070708]">{idx + 1}.</span>
                      {choice}
                    </button>
                  ))}
                </div>
              )}
              <div className="font-mono text-[#ff9d00] text-sm md:text-[1.2rem] uppercase tracking-[2px] animate-[pulse_2s_infinite_ease-in-out]">
                What do you do?
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* System Footer / Input Area */}
      <div className="bg-[rgba(0,0,0,0.6)] border-t border-[#7a4d00] p-4 md:p-[20px_40px] flex justify-center backdrop-blur-md">
        <div className="w-full md:w-[600px] flex flex-col justify-center">
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
      </div>
    </div>
  );
};
