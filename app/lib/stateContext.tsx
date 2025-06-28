import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

// Define the shape of the UI state
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

// Define the initial state
const initialState: UIState = {
  sidebarOpen: false,
  theme: 'system',
  notifications: [],
};

// Define action types
type Action =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<UIState['notifications'][0], 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

// Create the context
const UIStateContext = createContext<UIState | undefined>(undefined);
const UIDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

// Reducer function
function uiReducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
    case 'SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.payload,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: `${Date.now()}-${Math.random()}`,
            ...action.payload,
          },
        ],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    default:
      return state;
  }
}

// Provider component
export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <UIStateContext.Provider value={state}>
      <UIDispatchContext.Provider value={dispatch}>{children}</UIDispatchContext.Provider>
    </UIStateContext.Provider>
  );
}

// Custom hooks to use the context
export function useUIState() {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIProvider');
  }
  return context;
}

export function useUIDispatch() {
  const context = useContext(UIDispatchContext);
  if (context === undefined) {
    throw new Error('useUIDispatch must be used within a UIProvider');
  }
  return context;
}

// Convenience hooks for specific UI actions
export function useSidebar() {
  const { sidebarOpen } = useUIState();
  const dispatch = useUIDispatch();

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const setSidebar = (isOpen: boolean) => dispatch({ type: 'SET_SIDEBAR', payload: isOpen });

  return { sidebarOpen, toggleSidebar, setSidebar };
}

export function useTheme() {
  const { theme } = useUIState();
  const dispatch = useUIDispatch();

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => 
    dispatch({ type: 'SET_THEME', payload: newTheme });

  return { theme, setTheme };
}

export function useNotifications() {
  const { notifications } = useUIState();
  const dispatch = useUIDispatch();

  const addNotification = useCallback((notification: Omit<UIState['notifications'][0], 'id'>) => 
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification }), [dispatch]);
  
  const removeNotification = useCallback((id: string) => 
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }), [dispatch]);

  return { notifications, addNotification, removeNotification };
}