/**
 * Real-time Service
 * 
 * Handles WebSocket connections and real-time updates for live features
 * like chat notifications, workflow status updates, and system alerts.
 */

export interface RealtimeMessage {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
  userId?: string;
  organizationId?: string;
}

export interface RealtimeConnection {
  id: string;
  userId: string;
  organizationId?: string;
  connectedAt: number;
  lastActivity: number;
  subscriptions: string[];
}

export interface RealtimeEvent {
  type: 'message' | 'connection' | 'disconnection' | 'error';
  data: any;
  timestamp: number;
}

export type MessageHandler = (message: RealtimeMessage) => void;
export type ConnectionHandler = (connection: RealtimeConnection) => void;
export type ErrorHandler = (error: Error) => void;

export class RealtimeService {
  private static instance: RealtimeService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, MessageHandler[]>();
  private connectionHandlers: ConnectionHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private subscriptions = new Set<string>();
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;

  // Configuration
  private config = {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
    heartbeatInterval: 30000, // 30 seconds
    connectionTimeout: 10000, // 10 seconds
    maxMessageSize: 1024 * 1024, // 1MB
    enableCompression: false
  };

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(userId: string, organizationId?: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const url = new URL(this.config.url);
      url.searchParams.set('userId', userId);
      if (organizationId) {
        url.searchParams.set('organizationId', organizationId);
      }

      this.ws = new WebSocket(url.toString());
      
      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          this.ws.close();
          this.handleError(new Error('Connection timeout'));
        }
      }, this.config.connectionTimeout);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.clearConnectionTimeout();
        this.startHeartbeat();
        this.resubscribe();
        this.notifyConnection({ type: 'connection', data: { userId, organizationId }, timestamp: Date.now() });
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        this.clearConnectionTimeout();
        this.stopHeartbeat();
        this.handleDisconnection(event);
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        this.clearConnectionTimeout();
        this.handleError(error);
      };

    } catch (error) {
      this.isConnecting = false;
      this.handleError(error as Error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.clearConnectionTimeout();
    this.subscriptions.clear();
  }

  /**
   * Send message to server
   */
  send(type: string, payload: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const message: RealtimeMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateId()
    };

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this.handleError(error as Error);
      return false;
    }
  }

  /**
   * Subscribe to a channel/topic
   */
  subscribe(channel: string): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.add(channel);
      this.send('subscribe', { channel });
    }
  }

  /**
   * Unsubscribe from a channel/topic
   */
  unsubscribe(channel: string): void {
    if (this.subscriptions.has(channel)) {
      this.subscriptions.delete(channel);
      this.send('unsubscribe', { channel });
    }
  }

  /**
   * Add message handler
   */
  onMessage(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  /**
   * Remove message handler
   */
  offMessage(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Add connection handler
   */
  onConnection(handler: ConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }

  /**
   * Add error handler
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: RealtimeMessage = JSON.parse(event.data);
      
      // Validate message size
      if (event.data.length > this.config.maxMessageSize) {
        this.handleError(new Error('Message too large'));
        return;
      }

      // Handle message by type
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('Message handler error:', error);
          }
        });
      }

      // Handle system messages
      this.handleSystemMessage(message);

    } catch (error) {
      this.handleError(new Error('Invalid message format'));
    }
  }

  /**
   * Handle system messages
   */
  private handleSystemMessage(message: RealtimeMessage): void {
    switch (message.type) {
      case 'ping':
        this.send('pong', { timestamp: Date.now() });
        break;
      
      case 'error':
        this.handleError(new Error(message.payload.message || 'Server error'));
        break;
      
      case 'subscription_confirmed':
        console.log('Subscribed to:', message.payload.channel);
        break;
      
      case 'subscription_error':
        console.error('Subscription error:', message.payload.error);
        break;
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(event: CloseEvent): void {
    this.notifyConnection({ 
      type: 'disconnection', 
      data: { code: event.code, reason: event.reason }, 
      timestamp: Date.now() 
    });

    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    });
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (this.getConnectionStatus() === 'disconnected') {
        this.connect('', ''); // Will need to be updated with actual user info
      }
    }, delay);
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  /**
   * Resubscribe to channels after reconnection
   */
  private resubscribe(): void {
    this.subscriptions.forEach(channel => {
      this.send('subscribe', { channel });
    });
  }

  /**
   * Notify connection handlers
   */
  private notifyConnection(event: RealtimeEvent): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(event as any);
      } catch (error) {
        console.error('Connection handler error:', error);
      }
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Handle page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.send('away', { timestamp: Date.now() });
        } else {
          this.send('back', { timestamp: Date.now() });
        }
      });
    }

    // Handle beforeunload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.send('disconnect', { timestamp: Date.now() });
      });
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

/**
 * Real-time Hooks for React
 */
export class RealtimeHooks {
  /**
   * Hook for chat messages
   */
  static useChatMessages(organizationId: string) {
    const [messages, setMessages] = React.useState<RealtimeMessage[]>([]);
    const realtime = RealtimeService.getInstance();

    React.useEffect(() => {
      const handleMessage = (message: RealtimeMessage) => {
        if (message.type === 'chat_message' && message.payload.organizationId === organizationId) {
          setMessages(prev => [...prev, message]);
        }
      };

      realtime.onMessage('chat_message', handleMessage);
      realtime.subscribe(`chat:${organizationId}`);

      return () => {
        realtime.offMessage('chat_message', handleMessage);
        realtime.unsubscribe(`chat:${organizationId}`);
      };
    }, [organizationId]);

    return messages;
  }

  /**
   * Hook for workflow updates
   */
  static useWorkflowUpdates(organizationId: string) {
    const [updates, setUpdates] = React.useState<RealtimeMessage[]>([]);
    const realtime = RealtimeService.getInstance();

    React.useEffect(() => {
      const handleMessage = (message: RealtimeMessage) => {
        if (message.type === 'workflow_update' && message.payload.organizationId === organizationId) {
          setUpdates(prev => [...prev, message]);
        }
      };

      realtime.onMessage('workflow_update', handleMessage);
      realtime.subscribe(`workflow:${organizationId}`);

      return () => {
        realtime.offMessage('workflow_update', handleMessage);
        realtime.unsubscribe(`workflow:${organizationId}`);
      };
    }, [organizationId]);

    return updates;
  }

  /**
   * Hook for system notifications
   */
  static useSystemNotifications(userId: string) {
    const [notifications, setNotifications] = React.useState<RealtimeMessage[]>([]);
    const realtime = RealtimeService.getInstance();

    React.useEffect(() => {
      const handleMessage = (message: RealtimeMessage) => {
        if (message.type === 'notification' && message.payload.userId === userId) {
          setNotifications(prev => [...prev, message]);
        }
      };

      realtime.onMessage('notification', handleMessage);
      realtime.subscribe(`notifications:${userId}`);

      return () => {
        realtime.offMessage('notification', handleMessage);
        realtime.unsubscribe(`notifications:${userId}`);
      };
    }, [userId]);

    return notifications;
  }

  /**
   * Hook for connection status
   */
  static useConnectionStatus() {
    const [status, setStatus] = React.useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const realtime = RealtimeService.getInstance();

    React.useEffect(() => {
      const checkStatus = () => {
        setStatus(realtime.getConnectionStatus());
      };

      checkStatus();
      const interval = setInterval(checkStatus, 1000);

      return () => clearInterval(interval);
    }, []);

    return status;
  }
}

/**
 * Real-time Event Types
 */
export const REALTIME_EVENTS = {
  // Chat events
  CHAT_MESSAGE: 'chat_message',
  CHAT_TYPING: 'chat_typing',
  CHAT_READ: 'chat_read',
  
  // Workflow events
  WORKFLOW_STARTED: 'workflow_started',
  WORKFLOW_COMPLETED: 'workflow_completed',
  WORKFLOW_FAILED: 'workflow_failed',
  WORKFLOW_PROGRESS: 'workflow_progress',
  
  // System events
  NOTIFICATION: 'notification',
  ALERT: 'alert',
  SYSTEM_UPDATE: 'system_update',
  
  // User events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_AWAY: 'user_away',
  
  // Document events
  DOCUMENT_UPDATED: 'document_updated',
  DOCUMENT_SHARED: 'document_shared',
  
  // Analytics events
  METRICS_UPDATE: 'metrics_update',
  PERFORMANCE_ALERT: 'performance_alert'
} as const;

export type RealtimeEventType = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS]; 