import type { AccessRequestDataAccessInterface } from '@/app/contracts/DataAccess';
import type { AccessRequest, AccessRequestListParams } from '@/app/types/accessRequest.types';
import { createServerSupabaseClient } from '@/app/lib/supabase/server';
import { DataAccessError, NotFoundError } from '@/app/lib/dataAccess';

export class SupabaseAccessRequestDataAccess implements AccessRequestDataAccessInterface<AccessRequest> {
  async getById(id: string): Promise<AccessRequest> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('AccessRequest', id);
    }
    return data as AccessRequest;
  }

  async getAll(): Promise<AccessRequest[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .order('submittedAt', { ascending: false });

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }
    return data as AccessRequest[];
  }

  async create(data: Partial<AccessRequest>): Promise<AccessRequest> {
    const supabase = await createServerSupabaseClient();
    const id = crypto.randomUUID();
    const submittedAt = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from('access_requests')
      .insert([{
        id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        companyName: data.companyName || '',
        jobTitle: data.jobTitle || '',
        useCase: data.useCase || '',
        teamSize: data.teamSize || '1-5',
        industry: data.industry || '',
        expectedStartDate: data.expectedStartDate || '',
        additionalInfo: data.additionalInfo || null,
        status: data.status || 'pending',
        submittedAt,
      }])
      .select()
      .single();

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }
    return inserted as AccessRequest;
  }

  async update(id: string, data: Partial<AccessRequest>): Promise<AccessRequest> {
    const supabase = await createServerSupabaseClient();

    // First check if the access request exists
    await this.getById(id);

    const { data: updated, error } = await supabase
      .from('access_requests')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }
    return updated as AccessRequest;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('access_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }
  }

  // Custom methods for access requests
  async list(params?: AccessRequestListParams): Promise<AccessRequest[]> {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('access_requests')
      .select('*')
      .order('submittedAt', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }
    return data as AccessRequest[];
  }

  async approve(id: string, adminNotes?: string, reviewedBy?: string): Promise<AccessRequest> {
    return this.update(id, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      adminNotes,
    });
  }

  async reject(id: string, adminNotes?: string, reviewedBy?: string): Promise<AccessRequest> {
    return this.update(id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      adminNotes,
    });
  }
}

export const accessRequestSupabaseDataAccess = new SupabaseAccessRequestDataAccess(); 