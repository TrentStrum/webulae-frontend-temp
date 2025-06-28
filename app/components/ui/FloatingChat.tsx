'use client';
import React, { useState, useRef, useEffect, FormEvent, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bot, Send, X } from 'lucide-react';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';
import { useNotifications } from '@/app/lib/stateContext';
import { ARCHITECTURE_CONFIG } from '@/app/lib/env';
import { FrontendPromptService } from '@/app/lib/promptService';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// Memoized chat message component for performance
const ChatMessageItem = memo(({ message }: { message: ChatMessage }): React.ReactElement => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`max-w-[85%] p-3 ${
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </Card>
    </motion.div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

// Separate component for the actual chat functionality
function ChatInterface(): React.ReactElement {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();
  const { user, organization } = useAuthGuard();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setText('');
    setIsLoading(true);

    try {
      let response;
      
      if (ARCHITECTURE_CONFIG.USE_MODULAR_FOR_CHAT && ARCHITECTURE_CONFIG.ENABLE_FRONTEND_PROMPTS) {
        // Use new modular architecture with frontend prompt management
        const chatContext = {
          relevant_chunks: [], // Will be populated by backend
          user_role: { 
            role: user?.publicMetadata?.role || 'org_member', 
            permissions: [] 
          },
          org_settings: { 
            upselling_enabled: true,
            company_knowledge_enabled: true 
          }
        };

        const chatRequest = FrontendPromptService.createChatRequest(
          userMsg.content,
          chatContext,
          {
            include_organization_context: true,
            include_company_context: true,
            include_role_instructions: true,
            include_personality: true,
            max_context_length: 4000
          }
        );

        response = await fetch('/api/chat-new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatRequest),
        });
      } else {
        // Fallback to legacy endpoint
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg.content }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to get response';
        
        // Handle specific error cases
        if (errorMessage === 'No organization context') {
          throw new Error('Please select an organization to use the chat feature.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      console.error('Chat error', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      
      addNotification({
        message: errorMessage,
        type: 'error'
      });
      
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: `Sorry, I encountered an error: ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
      // Focus the input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !isLoading) {
        const form = e.currentTarget.closest('form');
        if (form) form.requestSubmit();
      }
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors z-50"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        aria-controls="floating-chat-panel"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            id="floating-chat-panel"
            className="fixed bottom-24 right-6 w-80 h-[450px] bg-background/90 backdrop-blur rounded-lg shadow-xl border flex flex-col z-50"
            role="dialog"
            aria-labelledby="floating-chat-title"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="p-3 border-b flex justify-between items-center bg-muted/50">
              <h2 id="floating-chat-title" className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                RAG Assistant
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3 space-y-3" aria-live="polite">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-6">
                  <Bot className="mx-auto mb-2 opacity-50" size={24} />
                  <p className="text-xs">Ask me anything about your documents and projects!</p>
                </div>
              )}
              
              {messages.map((message, i) => (
                <ChatMessageItem key={i} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="p-3 bg-muted max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 text-sm"
                  disabled={isLoading}
                  ref={inputRef}
                  onKeyDown={handleKeyDown}
                  aria-label="Chat message"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={isLoading || !text.trim()}
                  aria-label="Send message"
                >
                  <Send size={14} />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function FloatingChat(): React.ReactElement {
  // Always call hooks unconditionally - this is critical
  const authState = useAuthGuard();
  
  // Only render the chat interface if user is authenticated and can access chat
  if (!authState.isLoaded || !authState.isSignedIn || !authState.canAccessChat) {
    return <></>;
  }
  
  return <ChatInterface />;
}