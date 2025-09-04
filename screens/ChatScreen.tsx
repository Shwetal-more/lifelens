
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatScreenProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onCancel: () => void;
  userName: string;
  isLoading: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ history, onSendMessage, onCancel, userName, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="p-4 bg-card shadow-sm flex items-center justify-between z-10">
        <div className="text-center flex-grow">
            <h1 className="text-xl font-bold text-primary">Kai</h1>
            <p className="text-xs text-secondary">Your AI Financial Assistant</p>
        </div>
        <button onClick={onCancel} className="text-primary font-bold text-lg">✕</button>
      </header>

      <main className="flex-grow p-4 overflow-y-auto space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">AI</div>}
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-lg'
                  : 'bg-card text-primary rounded-bl-lg'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">AI</div>
                 <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-card text-primary rounded-bl-lg">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                        <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                        <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-card/80 backdrop-blur-sm border-t border-light-shadow">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Kai anything..."
            className="flex-grow w-full px-4 py-3 bg-background border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.949a.75.75 0 0 0 .95.826L11.25 9.25v1.5L4.643 12.01a.75.75 0 0 0-.826.95l1.414 4.949a.75.75 0 0 0 .95.826L16.25 15.25a.75.75 0 0 0 0-1.414L3.105 2.289Z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatScreen;
