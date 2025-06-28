'use client';
import React, { useState, useRef, useEffect, FormEvent, memo } from 'react';

import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { MessageSquare, X, Send, Bolt } from 'lucide-react';
import { useNotifications } from '@/app/lib/stateContext';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';
import { ARCHITECTURE_CONFIG } from '@/app/lib/env';
import { FrontendPromptService } from '@/app/lib/promptService';
import { WorkflowSuggestions } from '@/app/components/chat/WorkflowSuggestions';

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

// Memoized chat message component to prevent unnecessary re-renders
const ChatMessageItem = memo(({ message }: { message: ChatMessage }) => (
  <div
    className={`flex ${
      message.role === 'user' ? "justify-end" : "justify-start"
    }`}
  >
    <Card
      className={`p-3 max-w-[80%] ${
        message.role === 'user'
          ? "bg-primary text-primary-foreground"
          : "bg-muted"
      }`}
    >
      <p>{message.content}</p>
      {message.workflowExecution && (
        <div className="mt-2 pt-2 border-t border-current/20">
          <div className="flex items-center gap-2 text-xs">
            <Bolt className="h-3 w-3" />
            {message.workflowExecution.executed ? (
              <span className="text-green-300">✓ Workflow executed</span>
            ) : (
              <span className="text-red-300">✗ Workflow failed</span>
            )}
          </div>
        </div>
      )}
    </Card>
  </div>
));

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
        className="fixed bottom-24 right-6 w-[28rem] h-[620px] bg-background/90 backdrop-blur rounded-xl shadow-2xl border flex flex-col z-50"
        role="dialog"
        aria-labelledby="chat-title"
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 id="chat-title" className="text-lg font-semibold">Chat Support</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWorkflowSuggestions(!showWorkflowSuggestions)}
              className="h-8 w-8 p-0"
            >
              <Bolt className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
              <p>How can I help you today?</p>
              <p className="text-xs mt-2">Try asking about workflows or automations!</p>
            </div>
          )}
          
          {messages.map((message, i) => (
            <ChatMessageItem key={i} message={message} />
          ))}
          
          {/* Workflow Suggestions */}
          {showWorkflowSuggestions && organization && (
            <div className="mt-4">
              <WorkflowSuggestions
                organizationId={organization.id}
                userRole={user?.publicMetadata?.role || 'org_member'}
                onExecuteWorkflow={handleWorkflowExecution}
                onClose={() => setShowWorkflowSuggestions(false)}
              />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message or ask about workflows..."
              className="flex-1 resize-none"
              disabled={isLoading}
              ref={inputRef}
              onKeyDown={handleKeyDown}
              aria-label="Chat message"
              rows={1}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !text.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors z-50"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        aria-controls="chat-panel"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

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
      <div className="text-center text-muted-foreground py-8">
        <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
        <p>Loading...</p>
      </div>
    );
  }

  // Show sign-in prompt
  if (!authState.isSignedIn) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
        <p>Please sign in to use the chat feature.</p>
      </div>
    );
  }

  // Show organization selection prompt
  if (!authState.hasOrganization) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
        <p>Please select an organization to use the chat feature.</p>
      </div>
    );
  }

  // Render the chat interface
  return <ChatInterfaceContent />;
}