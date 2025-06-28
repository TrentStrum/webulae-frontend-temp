import '@testing-library/jest-dom';
import './__tests__/utils/testHelpers';

// Mock Next.js server types
global.Request = class MockRequest {
  url: string;
  method: string;
  headers: Headers;
  body: any;
  nextUrl: URL;

  constructor(url: string, init?: RequestInit) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body;
    this.nextUrl = new URL(url);
  }

  json() {
    return Promise.resolve(this.body);
  }

  text() {
    return Promise.resolve(JSON.stringify(this.body));
  }
} as any;

global.Response = class MockResponse {
  status: number;
  headers: Headers;
  body: any;

  constructor(body?: any, init?: ResponseInit) {
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
    this.body = body;
  }

  json() {
    // If body is already an object, return it directly
    if (typeof this.body === 'object' && this.body !== null) {
      return Promise.resolve(this.body);
    }
    // If body is a string, try to parse it
    if (typeof this.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(this.body));
      } catch {
        return Promise.resolve(this.body);
      }
    }
    return Promise.resolve(this.body);
  }

  text() {
    if (typeof this.body === 'string') {
      return Promise.resolve(this.body);
    }
    return Promise.resolve(JSON.stringify(this.body));
  }
} as any;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '',
}));

// Mock Next.js server
jest.mock('next/server', () => ({
  NextRequest: global.Request,
  NextResponse: class MockNextResponse {
    static json(data: any, init?: ResponseInit) {
      return new global.Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    }
    
    static redirect(url: string) {
      return new global.Response(null, { 
        status: 302, 
        headers: { Location: url } 
      });
    }
  },
}));

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
  currentUser: jest.fn(() => ({ id: 'test-user-id', firstName: 'Test', lastName: 'User' })),
  useUser: jest.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      imageUrl: 'https://example.com/avatar.jpg',
    },
  })),
  useAuth: jest.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    getToken: jest.fn(() => Promise.resolve('test-token')),
  })),
  useSignIn: jest.fn(() => ({
    isLoaded: true,
    signIn: jest.fn(),
    setActive: jest.fn(),
  })),
  useSignUp: jest.fn(() => ({
    isLoaded: true,
    signUp: jest.fn(),
  })),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
  ClerkProvider: jest.fn(({ children }) => children),
}));

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Ignore specific errors
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React does not recognize the') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('Warning: validateDOMNesting') ||
      args[0].includes('Modular Python service error:') ||
      args[0].includes('Error in company-system-prompts-new API:'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;
  
  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold || 0];
  }
  
  observe() {
    // Simulate an intersection
    setTimeout(() => {
      const entry = {
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        target: {} as Element,
        time: Date.now(),
      };
      
      this.callback([entry]);
    }, 100);
  }
  
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  
  // Required for TypeScript
  private callback: IntersectionObserverCallback = () => {};
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});