import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { 
  N8nOrganizationConfig, 
  N8nWorkflowPermission, 
  N8nChatTrigger 
} from "@/app/types/n8n.types";
import { DataAccessError } from "@/app/lib/dataAccess";
import type { Database } from "@/app/types/database.types";
import { supabase } from '@/app/lib/supabase/server';

const ORGANIZATION_CONFIG_TABLE = 'n8n_organization_configs';
const WORKFLOW_PERMISSIONS_TABLE = 'n8n_workflow_permissions';
const CHAT_TRIGGERS_TABLE = 'n8n_chat_triggers';

export const getN8nOrganizationConfig = async (organizationId: string): Promise<N8nOrganizationConfig | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(ORGANIZATION_CONFIG_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw new DataAccessError(`Failed to get n8n config: ${error.message}`);
  }

  return data;
};

export const saveN8nOrganizationConfig = async (config: Omit<N8nOrganizationConfig, 'created_at' | 'updated_at'>): Promise<N8nOrganizationConfig> => {
  const supabase = await createServerSupabaseClient();
  
  const configData = {
    ...config,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(ORGANIZATION_CONFIG_TABLE)
    .upsert(configData, { onConflict: 'organization_id' })
    .select()
    .single();

  if (error) {
    throw new DataAccessError(`Failed to save n8n config: ${error.message}`);
  }

  return data;
};

export const deleteN8nOrganizationConfig = async (organizationId: string): Promise<void> => {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from(ORGANIZATION_CONFIG_TABLE)
    .delete()
    .eq('organization_id', organizationId);

  if (error) {
    throw new DataAccessError(`Failed to delete n8n config: ${error.message}`);
  }
};

export const getN8nWorkflowPermissions = async (organizationId: string): Promise<N8nWorkflowPermission[]> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(WORKFLOW_PERMISSIONS_TABLE)
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    throw new DataAccessError(`Failed to get workflow permissions: ${error.message}`);
  }

  return data || [];
};

export const getN8nWorkflowPermission = async (workflowId: string, organizationId: string): Promise<N8nWorkflowPermission | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(WORKFLOW_PERMISSIONS_TABLE)
    .select('*')
    .eq('workflow_id', workflowId)
    .eq('organization_id', organizationId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new DataAccessError(`Failed to get workflow permission: ${error.message}`);
  }

  return data;
};

export const saveN8nWorkflowPermission = async (permission: Omit<N8nWorkflowPermission, 'created_at'>): Promise<N8nWorkflowPermission> => {
  const supabase = await createServerSupabaseClient();
  
  const permissionData = {
    ...permission,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(WORKFLOW_PERMISSIONS_TABLE)
    .upsert(permissionData, { onConflict: 'workflow_id,organization_id' })
    .select()
    .single();

  if (error) {
    throw new DataAccessError(`Failed to save workflow permission: ${error.message}`);
  }

  return data;
};

export const deleteN8nWorkflowPermission = async (workflowId: string, organizationId: string): Promise<void> => {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from(WORKFLOW_PERMISSIONS_TABLE)
    .delete()
    .eq('workflow_id', workflowId)
    .eq('organization_id', organizationId);

  if (error) {
    throw new DataAccessError(`Failed to delete workflow permission: ${error.message}`);
  }
};

export const getN8nChatTriggers = async (organizationId: string): Promise<N8nChatTrigger[]> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(CHAT_TRIGGERS_TABLE)
    .select('*')
    .eq('organization_id', organizationId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new DataAccessError(`Failed to get chat triggers: ${error.message}`);
  }

  return data || [];
};

export const getN8nChatTrigger = async (triggerId: string): Promise<N8nChatTrigger | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(CHAT_TRIGGERS_TABLE)
    .select('*')
    .eq('id', triggerId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new DataAccessError(`Failed to get chat trigger: ${error.message}`);
  }

  return data;
};

export const saveN8nChatTrigger = async (trigger: Omit<N8nChatTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<N8nChatTrigger> => {
  const supabase = await createServerSupabaseClient();
  
  const triggerData = {
    ...trigger,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(CHAT_TRIGGERS_TABLE)
    .insert(triggerData)
    .select()
    .single();

  if (error) {
    throw new DataAccessError(`Failed to save chat trigger: ${error.message}`);
  }

  return data;
};

export const updateN8nChatTrigger = async (triggerId: string, updates: Partial<Omit<N8nChatTrigger, 'id' | 'created_at' | 'updated_at'>>): Promise<N8nChatTrigger> => {
  const supabase = await createServerSupabaseClient();
  
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(CHAT_TRIGGERS_TABLE)
    .update(updateData)
    .eq('id', triggerId)
    .select()
    .single();

  if (error) {
    throw new DataAccessError(`Failed to update chat trigger: ${error.message}`);
  }

  return data;
};

export const deleteN8nChatTrigger = async (triggerId: string): Promise<void> => {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from(CHAT_TRIGGERS_TABLE)
    .delete()
    .eq('id', triggerId);

  if (error) {
    throw new DataAccessError(`Failed to delete chat trigger: ${error.message}`);
  }
};

export const findMatchingChatTriggers = async (message: string, organizationId: string, userRole: string): Promise<N8nChatTrigger[]> => {
  const triggers = await getN8nChatTriggers(organizationId);
  
  return triggers.filter(trigger => {
    // Check if user has permission
    if (!trigger.permissions.includes(userRole) && !trigger.permissions.includes('*')) {
      return false;
    }

    // Check if any trigger phrase matches the message
    return trigger.triggerPhrases.some(phrase => 
      message.toLowerCase().includes(phrase.toLowerCase())
    );
  });
};

export async function getN8nOrganizationConfig(organizationId: string): Promise<N8nOrganizationConfig | null> {
  try {
    const { data, error } = await supabase
      .from('n8n_organization_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Error fetching n8n organization config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getN8nOrganizationConfig:', error);
    return null;
  }
}

export async function createN8nOrganizationConfig(config: Omit<N8nOrganizationConfig, 'created_at' | 'updated_at'>): Promise<N8nOrganizationConfig | null> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('n8n_organization_configs')
      .insert({
        ...config,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating n8n organization config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createN8nOrganizationConfig:', error);
    return null;
  }
}

export async function updateN8nOrganizationConfig(organizationId: string, updates: Partial<N8nOrganizationConfig>): Promise<N8nOrganizationConfig | null> {
  try {
    const { data, error } = await supabase
      .from('n8n_organization_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating n8n organization config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateN8nOrganizationConfig:', error);
    return null;
  }
}

export async function deleteN8nOrganizationConfig(organizationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('n8n_organization_configs')
      .delete()
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error deleting n8n organization config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteN8nOrganizationConfig:', error);
    return false;
  }
}

export async function getN8nWorkflowPermissions(organizationId: string): Promise<N8nWorkflowPermission[]> {
  try {
    const { data, error } = await supabase
      .from('n8n_workflow_permissions')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching n8n workflow permissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getN8nWorkflowPermissions:', error);
    return [];
  }
}

export async function createN8nWorkflowPermission(permission: Omit<N8nWorkflowPermission, 'created_at'>): Promise<N8nWorkflowPermission | null> {
  try {
    const { data, error } = await supabase
      .from('n8n_workflow_permissions')
      .insert({
        ...permission,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating n8n workflow permission:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createN8nWorkflowPermission:', error);
    return null;
  }
}

export async function updateN8nWorkflowPermission(workflowId: string, organizationId: string, updates: Partial<N8nWorkflowPermission>): Promise<N8nWorkflowPermission | null> {
  try {
    const { data, error } = await supabase
      .from('n8n_workflow_permissions')
      .update(updates)
      .eq('workflow_id', workflowId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating n8n workflow permission:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateN8nWorkflowPermission:', error);
    return null;
  }
}

export async function deleteN8nWorkflowPermission(workflowId: string, organizationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('n8n_workflow_permissions')
      .delete()
      .eq('workflow_id', workflowId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error deleting n8n workflow permission:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteN8nWorkflowPermission:', error);
    return false;
  }
}

export async function getN8nChatTriggers(organizationId: string): Promise<N8nChatTrigger[]> {
  try {
    const { data, error } = await supabase
      .from('n8n_chat_triggers')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching n8n chat triggers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getN8nChatTriggers:', error);
    return [];
  }
}

export async function createN8nChatTrigger(trigger: Omit<N8nChatTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<N8nChatTrigger | null> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('n8n_chat_triggers')
      .insert({
        ...trigger,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating n8n chat trigger:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createN8nChatTrigger:', error);
    return null;
  }
}

export async function updateN8nChatTrigger(triggerId: string, updates: Partial<N8nChatTrigger>): Promise<N8nChatTrigger | null> {
  try {
    const { data, error } = await supabase
      .from('n8n_chat_triggers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', triggerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating n8n chat trigger:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateN8nChatTrigger:', error);
    return null;
  }
}

export async function deleteN8nChatTrigger(triggerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('n8n_chat_triggers')
      .delete()
      .eq('id', triggerId);

    if (error) {
      console.error('Error deleting n8n chat trigger:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteN8nChatTrigger:', error);
    return false;
  }
} 