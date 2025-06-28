export type DataAccessInterface<T> = {
	getById(id: string): Promise<T>;
	getAll(): Promise<T[]>;
	create(data: Partial<T>): Promise<T>;
	update(id: string, data: Partial<T>): Promise<T>;
	delete(id: string): Promise<void>;
	
	// Optional batch operations for performance optimization
	getAllByIds?(ids: string[]): Promise<T[]>;
	batchCreate?(items: Partial<T>[]): Promise<T[]>;
	batchUpdate?(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]>;
};

// Extended interface for access requests with specific methods
export type AccessRequestDataAccessInterface<T> = DataAccessInterface<T> & {
	approve(id: string, adminNotes?: string, reviewedBy?: string): Promise<T>;
	reject(id: string, adminNotes?: string, reviewedBy?: string): Promise<T>;
	list(params?: any): Promise<T[]>;
};