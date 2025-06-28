import { backendMode } from '@/app/config/backendMode';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { Project } from '@/app/types';

import { projectSupabaseDataAccess } from './supabase';
import { projectDuckDBDataAccess } from './duckDb';
import { projectMockDataAccess } from './mock';

let instance: DataAccessInterface<Project>;

switch (backendMode) {
	case 'supabase':
		instance = projectSupabaseDataAccess;
		break;
	case 'duckdb':
		instance = projectDuckDBDataAccess;
		break;
	default:
		instance = projectMockDataAccess;
}

export const getProjectDataAccess = (): DataAccessInterface<Project> => instance; 
