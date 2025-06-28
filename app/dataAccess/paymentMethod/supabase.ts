import type { PaymentMethod } from '@/app/types';
import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import { createServerSupabaseClient } from '@/app/lib/supabase/server';

export const paymentMethodSupabaseDataAccess: DataAccessInterface<PaymentMethod> = {
    async getById(id) {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) throw new Error('Payment method not found');
        return data as PaymentMethod;
    },

    async getAll() {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase.from('payment_methods').select('*');
        if (error) throw new Error('Failed to fetch payment methods');
        return data as PaymentMethod[];
    },

    async create(data) {
        const supabase = await createServerSupabaseClient();
        const { data: inserted, error } = await supabase
            .from('payment_methods')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return inserted as PaymentMethod;
    },

    async update(id, data) {
        const supabase = await createServerSupabaseClient();
        const { data: updated, error } = await supabase
            .from('payment_methods')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return updated as PaymentMethod;
    },

    async delete(id) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.from('payment_methods').delete().eq('id', id);
        if (error) throw error;
    },
};
