'use client';
import React, { useState, useRef, useEffect, FormEvent, memo } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Bot, Send, X } from 'lucide-react';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';
import { useNotifications } from '@/app/lib/stateContext';
import { ARCHITECTURE_CONFIG } from '@/app/lib/env';
import { FrontendPromptService } from '@/app/lib/promptService';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// Memoized chat message component for performance
const ChatMessageItem = memo(({ message }: { message: ChatMessage }): React.ReactElement => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-[85%] p-3 ${
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </Card>
    </div>
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors z-[99] group"
        aria-label={isOpen ? "Close RAG assistant" : "Open RAG assistant"}
        aria-expanded={isOpen}
        aria-controls="floating-chat-panel"
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <div className="relative">
            <Bot size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div 
          id="floating-chat-panel"
          className="fixed bottom-24 right-6 w-80 h-[450px] bg-background rounded-lg shadow-xl border flex flex-col z-[100]"
          role="dialog"
          aria-labelledby="floating-chat-title"
        >
          {/* Header */}
          <div className="p-3 border-b flex justify-between items-center bg-primary/5">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 id="floating-chat-title" className="text-sm font-semibold">RAG Assistant</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" aria-live="polite">
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
                <Card className="p-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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
        </div>
      )}
    </>
  );
}

export default function FloatingChat(): React.ReactElement {
  // Always call hooks unconditionally - this is critical
  const authState = useAuthGuard();
  
  // Debug logging
  console.log('FloatingChat Debug:', authState);
  
  // Only render the chat interface if user is authenticated and can access chat
  if (!authState.isLoaded || !authState.isSignedIn || !authState.canAccessChat) {
    return <></>; // Return empty fragment instead of null
  }
  
  return <ChatInterface />;
} 