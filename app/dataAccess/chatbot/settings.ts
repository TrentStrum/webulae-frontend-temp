import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { ChatbotSettings } from "@/app/types/chatbot.types";
import { DataAccessError } from "@/app/lib/dataAccess";
import type { Database } from "@/app/types/database.types";

const TABLE_NAME = 'organization_chatbot_settings';

export const getChatbotSettings = async (organizationId: string): Promise<ChatbotSettings> => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('organization_id', organizationId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new DataAccessError(`Failed to retrieve chatbot settings: ${error.message}`);
    }

    if (!data) {
        // Return default settings if none are found in the database
        return {
            organization_id: organizationId,
            allowed_services: [],
            upselling_enabled: true,
            company_knowledge_enabled: true,
        };
    }

    // Convert allowed_services from JSONB to array
    return {
        organization_id: data.organization_id,
        allowed_services: typeof data.allowed_services === 'string' 
            ? JSON.parse(data.allowed_services) 
            : data.allowed_services || [],
        upselling_enabled: data.upselling_enabled ?? true,
        company_knowledge_enabled: data.company_knowledge_enabled ?? true,
    };
};

export const saveChatbotSettings = async (settings: ChatbotSettings): Promise<ChatbotSettings> => {
    try {
        const supabase = await createServerSupabaseClient();
        
        // Prepare the data for insertion/update
        const settingsData = {
            organization_id: settings.organization_id,
            allowed_services: settings.allowed_services,
            upselling_enabled: settings.upselling_enabled,
            company_knowledge_enabled: settings.company_knowledge_enabled,
            updated_at: new Date().toISOString()
        };

        // Try to update first, if no rows affected, insert
        const { data: updateData, error: updateError } = await supabase
            .from(TABLE_NAME)
            .update(settingsData)
            .eq('organization_id', settings.organization_id)
            .select()
            .single();

        if (updateError && updateError.code === 'PGRST116') {
            // No rows updated, insert new record
            const { data: insertData, error: insertError } = await supabase
                .from(TABLE_NAME)
                .insert(settingsData)
                .select()
                .single();

            if (insertError) {
                throw new DataAccessError(`Failed to save chatbot settings: ${insertError.message}`);
            }

            return {
                organization_id: insertData.organization_id,
                allowed_services: typeof insertData.allowed_services === 'string' 
                    ? JSON.parse(insertData.allowed_services) 
                    : insertData.allowed_services || [],
                upselling_enabled: insertData.upselling_enabled ?? true,
                company_knowledge_enabled: insertData.company_knowledge_enabled ?? true,
            };
        }

        if (updateError) {
            throw new DataAccessError(`Failed to save chatbot settings: ${updateError.message}`);
        }

        // Convert the response back to match the ChatbotSettings interface
        return {
            organization_id: updateData.organization_id,
            allowed_services: typeof updateData.allowed_services === 'string' 
                ? JSON.parse(updateData.allowed_services) 
                : updateData.allowed_services || [],
            upselling_enabled: updateData.upselling_enabled ?? true,
            company_knowledge_enabled: updateData.company_knowledge_enabled ?? true,
        };
    } catch (error) {
        console.error('Error in saveChatbotSettings:', error);
        throw error;
    }
}; 