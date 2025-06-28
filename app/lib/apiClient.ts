import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';

// Create a custom error class for API errors
export class ApiError extends Error {
  status: number;
  details?: unknown;
  
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Create axios instance with default config
const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || '',
	timeout: 15000, // 15 second timeout
	headers: {
		'Content-Type': 'application/json',
	}
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			const status = error.response.status;
			const data = error.response.data as unknown;
			const message = (data as { error?: string })?.error || 'An error occurred';
			const details = (data as { details?: unknown })?.details;
			
			throw new ApiError(message, status, details);
		} else if (error.request) {
			// The request was made but no response was received
			throw new ApiError('No response from server', 503);
		} else {
			// Something happened in setting up the request that triggered an Error
			throw new ApiError(error.message || 'Request configuration error', 500);
		}
	}
);

// Add request interceptor for authentication and CSRF protection
axiosInstance.interceptors.request.use(
	async (config) => {
		// Add Clerk authentication token
		if (typeof window !== 'undefined') {
			// Client-side: get token from Clerk
			try {
				// For client-side requests, we'll rely on the session cookie
				// The server-side auth middleware will handle the token verification
				// We don't need to manually add the token here as Clerk handles it automatically
			} catch (error) {
				console.warn('Failed to get Clerk token:', error);
			}
		}
		
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export const apiClient = {
	get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
		const { data } = await axiosInstance.get<T>(url, config);
		return data;
	},
	post: async <TPayload = unknown, TResponse = TPayload>(
		url: string,
		payload?: TPayload,
		config?: AxiosRequestConfig,
	): Promise<TResponse> => {
		const { data } = await axiosInstance.post<TPayload, AxiosResponse<TResponse>>(
			url,
			payload,
			config,
		);
		return data;
	},
	put: async <T>(url: string, payload?: object, config?: AxiosRequestConfig): Promise<T> => {
		const { data } = await axiosInstance.put<T>(url, payload, config);
		return data;
	},
	patch: async <T>(url: string, payload?: object, config?: AxiosRequestConfig): Promise<T> => {
		const { data } = await axiosInstance.patch<T>(url, payload, config);
		return data;
	},
	delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
		const { data } = await axiosInstance.delete<T>(url, config);
		return data;
	},
};