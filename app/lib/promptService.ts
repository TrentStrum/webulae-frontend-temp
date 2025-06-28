/**
 * Frontend Prompt Management Service
 * 
 * This service handles prompt building and management on the frontend,
 * giving you full control over how prompts are constructed and allowing
 * for dynamic prompt generation based on user context, settings, and preferences.
 */

export interface UserRole {
  role: 'global_admin' | 'org_admin' | 'org_member';
  permissions: string[];
}

export interface OrganizationSettings {
  allowed_services?: string[];
  upselling_enabled: boolean;
  company_knowledge_enabled: boolean;
}

export interface ChatContext {
  relevant_chunks: Array<{
    content: string;
    source_type: string;
    source_name: string;
    relevance: number;
  }>;
  user_role: UserRole;
  org_settings: OrganizationSettings;
}

export interface PromptConfig {
  include_organization_context: boolean;
  include_company_context: boolean;
  include_role_instructions: boolean;
  include_personality: boolean;
  max_context_length: number;
}

export class FrontendPromptService {
  private static defaultConfig: PromptConfig = {
    include_organization_context: true,
    include_company_context: true,
    include_role_instructions: true,
    include_personality: true,
    max_context_length: 4000
  };

  /**
   * Build a comprehensive system prompt based on user context and settings
   */
  static buildSystemPrompt(
    context: ChatContext,
    config: Partial<PromptConfig> = {}
  ): string {
    const finalConfig = { ...this.defaultConfig, ...config };
    const promptParts: string[] = [];

    // Bot identity and personality from system prompts
    if (finalConfig.include_personality) {
      // Extract bot name and personality from system prompts
      const botIdentityPrompts = context.relevant_chunks.filter(
        chunk => chunk.source_type === 'system_prompt' && chunk.category === 'Bot Identity'
      );
      
      let botName = "Assistant"; // Default
      let personality = "You are a helpful assistant."; // Default
      
      for (const prompt of botIdentityPrompts) {
        const content = prompt.content.toLowerCase();
        if (content.includes('name') || content.includes('call me')) {
          // Extract bot name from content
          const nameMatch = content.match(/name[:\s]+([a-z\s]+)/i);
          if (nameMatch) {
            botName = nameMatch[1].trim();
          }
        }
        if (content.includes('personality') || content.includes('tone')) {
          personality = prompt.content;
        }
      }
      
      promptParts.push(`Your name is ${botName}. ${personality}`);
    } else {
      promptParts.push(`Your name is Assistant.`);
    }

    // Role-specific instructions
    if (finalConfig.include_role_instructions) {
      const roleInstructions = this.getRoleInstructions(context.user_role.role);
      promptParts.push(`**Your Role:**\n${roleInstructions}`);
    }

    // Organization context (if available)
    if (finalConfig.include_organization_context) {
      const orgChunks = context.relevant_chunks.filter(
        chunk => chunk.source_type === 'org_document' || chunk.source_type === 'org_faq'
      );
      if (orgChunks.length > 0) {
        const orgContext = orgChunks
          .map(chunk => chunk.content)
          .join('\n\n')
          .substring(0, finalConfig.max_context_length);
        promptParts.push(`**Organization Context:**\n${orgContext}`);
      }
    }

    // Company context (if available)
    if (finalConfig.include_company_context && context.org_settings.company_knowledge_enabled) {
      const companyChunks = context.relevant_chunks.filter(
        chunk => chunk.source_type === 'company_document' || chunk.source_type === 'company_faq'
      );
      if (companyChunks.length > 0) {
        const companyContext = companyChunks
          .map(chunk => chunk.content)
          .join('\n\n')
          .substring(0, finalConfig.max_context_length);
        promptParts.push(`**Company Context (JovianCloudWorks):**\n${companyContext}`);
      }
    }

    return promptParts.join('\n\n');
  }

  /**
   * Build a user prompt with context and query
   */
  static buildUserPrompt(
    query: string,
    context: ChatContext,
    config: Partial<PromptConfig> = {}
  ): string {
    const finalConfig = { ...this.defaultConfig, ...config };
    const promptParts: string[] = [];

    // Add context sections
    if (finalConfig.include_organization_context) {
      const orgChunks = context.relevant_chunks.filter(
        chunk => chunk.source_type === 'org_document' || chunk.source_type === 'org_faq'
      );
      if (orgChunks.length > 0) {
        const orgContext = orgChunks
          .map(chunk => chunk.content)
          .join('\n\n')
          .substring(0, finalConfig.max_context_length);
        promptParts.push(`**Organization-Specific Context:**\n${orgContext}`);
      } else {
        promptParts.push(`**Organization-Specific Context:**\nNo specific context found for this organization.`);
      }
    }

    if (finalConfig.include_company_context && context.org_settings.company_knowledge_enabled) {
      const companyChunks = context.relevant_chunks.filter(
        chunk => chunk.source_type === 'company_document' || chunk.source_type === 'company_faq'
      );
      if (companyChunks.length > 0) {
        const companyContext = companyChunks
          .map(chunk => chunk.content)
          .join('\n\n')
          .substring(0, finalConfig.max_context_length);
        promptParts.push(`**General Company Context (JovianCloudWorks):**\n${companyContext}`);
      } else {
        promptParts.push(`**General Company Context (JovianCloudWorks):**\nNo general company context found.`);
      }
    }

    // Add the user's question
    promptParts.push(`**User's Question:** ${query}`);

    return promptParts.join('\n\n');
  }

  /**
   * Handle upselling opportunities based on query and context
   */
  static handleUpselling(
    query: string,
    context: ChatContext
  ): string | null {
    // Only show upselling for admin users if enabled
    if (!context.org_settings.upselling_enabled || 
        !['global_admin', 'org_admin'].includes(context.user_role.role)) {
      return null;
    }

    // Check for upselling triggers
    const upsellKeywords = ['service', 'pricing', 'help with', 'support', 'feature', 'cost', 'plan'];
    const hasUpsellTrigger = upsellKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );

    // If no relevant context found and has upselling trigger, suggest upselling
    if (hasUpsellTrigger && context.relevant_chunks.length === 0) {
      return "It looks like you're asking about a service we might be able to help with. Here are some related offerings from JovianCloudWorks:\n\n" +
             "• **AI Strategy Consulting**: Expert guidance on implementing AI solutions\n" +
             "• **Custom RAG Development**: Tailored retrieval-augmented generation systems\n" +
             "• **Document Processing**: Automated document analysis and insights\n" +
             "• **Integration Services**: Seamless integration with your existing systems\n\n" +
             "Would you like to learn more about any of these services?";
    }

    return null;
  }

  /**
   * Get role-specific instructions
   */
  private static getRoleInstructions(role: string): string {
    const instructions = {
      global_admin: "You are the lead AI strategist for JovianCloudWorks, providing expert advice with access to all available data.",
      org_admin: "You are assisting an organization administrator. Provide detailed, actionable guidance based on their documents and JCW's services.",
      org_member: "You are assisting an organization member. Provide helpful, practical information based on their company's knowledge base and JCW's official documentation."
    };

    return instructions[role as keyof typeof instructions] || 
           "You are a helpful assistant.";
  }

  /**
   * Create a chat request with frontend-built prompts
   */
  static createChatRequest(
    message: string,
    context: ChatContext,
    config: Partial<PromptConfig> = {}
  ) {
    const systemPrompt = this.buildSystemPrompt(context, config);
    const userPrompt = this.buildUserPrompt(message, context, config);
    const upsellResponse = this.handleUpselling(message, context);

    return {
      message,
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      upsell_response: upsellResponse,
      context: {
        user_role: context.user_role,
        org_settings: context.org_settings,
        relevant_chunks_count: context.relevant_chunks.length
      }
    };
  }

  /**
   * Validate prompt configuration
   */
  static validateConfig(config: Partial<PromptConfig>): boolean {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    if (finalConfig.max_context_length <= 0) {
      return false;
    }

    if (finalConfig.max_context_length > 8000) {
      return false;
    }

    return true;
  }
} 