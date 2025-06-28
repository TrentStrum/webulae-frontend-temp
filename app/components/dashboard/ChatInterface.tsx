'use client';
import React, { useState, useRef, useEffect, FormEvent, memo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  X, 
  Send, 
  Zap, 
  Bot, 
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { useNotifications } from '@/app/lib/stateContext';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';
import { ARCHITECTURE_CONFIG } from '@/app/lib/env';
import { FrontendPromptService } from '@/app/lib/promptService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  workflowExecution?: {
    executed: boolean;
    workflowId?: string;
    message?: string;
    error?: string;
  };
}

// Memoized chat message component for performance
const ChatMessageItem = memo(({ message }: { message: ChatMessage }): React.ReactElement => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex items-start gap-3 max-w-[85%]">
        {!isUser && (
          <Avatar className="mt-0.5 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
            <AvatarImage src="/bot-avatar.png" />
          </Avatar>
        )}
        
        <Card className={`${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50'
        } overflow-hidden`}>
          <CardContent className="p-3">
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            
            {message.workflowExecution && (
              <div className="mt-2 pt-2 border-t border-current/20">
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="h-3 w-3" />
                  {message.workflowExecution.executed ? (
                    <span className="text-green-300">✓ Workflow executed</span>
                  ) : (
                    <span className="text-red-300">✗ Workflow failed</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {isUser && (
          <Avatar className="mt-0.5 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
            <AvatarImage src="/user-avatar.png" />
          </Avatar>
        )}
      </div>
    </div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

// Separate component for the actual chat functionality
function ChatInterfaceContent(): React.ReactElement {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWorkflowSuggestions, setShowWorkflowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  // Check if message is workflow-related
  const isWorkflowRelated = (message: string): boolean => {
    const workflowKeywords = [
      'workflow', 'automation', 'run', 'execute', 'trigger', 'process',
      'generate', 'create', 'send', 'export', 'import', 'sync', 'backup',
      'report', 'invoice', 'notification', 'email', 'data', 'task'
    ];
    
    const lowerMessage = message.toLowerCase();
    return workflowKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const sendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setText('');
    setIsLoading(true);

    // Check if we should show workflow suggestions
    if (isWorkflowRelated(text)) {
      setShowWorkflowSuggestions(true);
    }

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
      
      // Handle n8n workflow response
      let botResponse = data.response;
      let workflowExecution = undefined;
      
      if (data.n8n_workflow?.executed) {
        const workflowMsg = data.n8n_workflow.message;
        if (workflowMsg) {
          botResponse = `${botResponse}\n\n🤖 **Workflow Executed:** ${workflowMsg}`;
        }
        
        // If workflow requires confirmation, add a note
        if (data.n8n_workflow.requires_confirmation) {
          botResponse += `\n\n⚠️ **Confirmation Required:** ${data.n8n_workflow.confirmation_message || 'Please confirm this action.'}`;
        }

        workflowExecution = {
          executed: true,
          workflowId: data.n8n_workflow.workflow_id,
          message: workflowMsg
        };
      } else if (data.n8n_workflow?.error) {
        botResponse += `\n\n❌ **Workflow Error:** ${data.n8n_workflow.error}`;
        workflowExecution = {
          executed: false,
          error: data.n8n_workflow.error
        };
      }
      
      setMessages((prev) => [...prev, { 
        role: 'bot', 
        content: botResponse,
        workflowExecution
      }]);
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

  const handleWorkflowExecution = (workflowId: string) => {
    // Add a message indicating the workflow was executed
    setMessages((prev) => [...prev, { 
      role: 'bot', 
      content: `✅ Workflow executed successfully!`,
      workflowExecution: {
        executed: true,
        workflowId
      }
    }]);
    
    // Hide workflow suggestions after execution
    setShowWorkflowSuggestions(false);
  };

  // Lazy load the chat panel only when opened
  const renderChatPanel = () => {
    if (!isOpen) return null;
    
    return (
      <div 
        id="chat-panel"
        className="fixed bottom-24 right-6 w-[28rem] h-[620px] bg-background/95 backdrop-blur-md rounded-xl shadow-xl border border-border/50 flex flex-col z-50 overflow-hidden"
        role="dialog"
        aria-labelledby="chat-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/30">
          <h2 id="chat-title" className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat Support
          </h2>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowWorkflowSuggestions(!showWorkflowSuggestions)}
                    className="h-8 w-8 rounded-full"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Workflow suggestions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" aria-live="polite">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8 px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium mb-2">How can I help you today?</p>
              <p className="text-sm">Try asking about workflows or automations!</p>
            </div>
          )}
          
          {messages.map((message, i) => (
            <ChatMessageItem key={i} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-3 max-w-[85%]">
                <Avatar className="mt-0.5 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                  <AvatarImage src="/bot-avatar.png" />
                </Avatar>
                
                <Card className="bg-muted/50 overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Form */}
        <div className="p-4 border-t border-border/50 bg-muted/30">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message or ask about workflows..."
              className="flex-1 resize-none min-h-[44px] max-h-[120px] py-3 px-4"
              disabled={isLoading}
              ref={inputRef}
              onKeyDown={handleKeyDown}
              aria-label="Chat message"
              rows={1}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !text.trim()}
              aria-label="Send message"
              className="h-[44px] w-[44px] rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 h-14 w-14"
        size="icon"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        aria-controls="chat-panel"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>

      {/* Lazy load chat panel */}
      {renderChatPanel()}
    </>
  );
}

export default function ChatInterface(): React.ReactElement {
  // Always call hooks unconditionally - this is critical
  const authState = useAuthGuard();

  // Show loading state
  if (!authState.isLoaded) {
    return (
      <div className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 h-14 w-14 bg-muted flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show sign-in prompt
  if (!authState.isSignedIn) {
    return null; // Don't show anything if not signed in
  }

  // Show organization selection prompt
  if (!authState.hasOrganization) {
    return null; // Don't show anything if no organization selected
  }

  // Render the chat interface
  return <ChatInterfaceContent />;
}