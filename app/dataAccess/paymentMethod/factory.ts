import { backendMode } from '@/app/config/backendMode';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { PaymentMethod } from '@/app/types';

import { paymentMethodSupabaseDataAccess } from './supabase';
import { paymentMethodDuckDBDataAccess } from './duckDb';
import { paymentMethodMockDataAccess } from './mock';

let instance: DataAccessInterface<PaymentMethod>;

switch (backendMode) {
    case 'supabase':
        instance = paymentMethodSupabaseDataAccess;
        break;
    case 'duckdb':
        instance = paymentMethodDuckDBDataAccess;
        break;
    default:
        instance = paymentMethodMockDataAccess;
}

export const getPaymentMethodDataAccess = (): DataAccessInterface<PaymentMethod> => instance;
