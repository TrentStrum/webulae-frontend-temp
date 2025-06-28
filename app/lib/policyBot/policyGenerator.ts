import { 
  PolicyGenerationRequest, 
  PolicyGenerationResponse, 
  PolicySectionContent,
  PolicyTemplate,
  PolicyBotSettings 
} from '@/app/types/policyBot.types';
import { getPolicyTemplate } from './policyTemplates';

export class PolicyGenerator {
  private settings: PolicyBotSettings;

  constructor(settings: PolicyBotSettings) {
    this.settings = settings;
  }

  /**
   * Generate a policy document based on template and variables
   */
  async generatePolicy(request: PolicyGenerationRequest): Promise<PolicyGenerationResponse> {
    try {
      // Get the template
      const template = typeof request.template === 'string' 
        ? getPolicyTemplate(request.template)
        : request.template;

      if (!template) {
        throw new Error('Invalid policy template');
      }

      // Generate sections
      const sections = await this.generateSections(template, request);

      // Generate title
      const title = await this.generateTitle(template, request.variables);

      // Create policy ID
      const policyId = this.generatePolicyId(request.organizationId);

      // Calculate word count
      const wordCount = this.calculateWordCount(sections);

      // Generate legal disclaimer if needed
      const legalDisclaimer = request.includeLegalLanguage 
        ? await this.generateLegalDisclaimer(template, request.variables)
        : undefined;

      // Generate review notes if needed
      const reviewNotes = template.requiresReview 
        ? await this.generateReviewNotes(sections, template)
        : undefined;

      return {
        policyId,
        title,
        sections,
        metadata: {
          generatedAt: new Date().toISOString(),
          template: template.id,
          organizationId: request.organizationId,
          version: '1.0',
          wordCount
        },
        legalDisclaimer,
        reviewNotes
      };
    } catch (error) {
      console.error('Policy generation failed:', error);
      throw new Error(`Failed to generate policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate policy sections using AI
   */
  private async generateSections(
    template: PolicyTemplate, 
    request: PolicyGenerationRequest
  ): Promise<PolicySectionContent[]> {
    const sections: PolicySectionContent[] = [];

    for (let i = 0; i < template.sections.length; i++) {
      const sectionType = template.sections[i];
      const defaultContent = template.defaultContent[sectionType] || '';
      
      // Replace variables in default content
      let content = this.replaceVariables(defaultContent, request.variables);
      
      // Enhance content with AI if needed
      if (this.shouldEnhanceSection(sectionType, content)) {
        content = await this.enhanceSectionContent(sectionType, content, request);
      }

      sections.push({
        section: sectionType,
        title: this.getSectionTitle(sectionType),
        content,
        required: this.isSectionRequired(sectionType),
        order: i
      });
    }

    // Add custom sections if provided
    if (request.customSections) {
      sections.push(...request.customSections.map((section, index) => ({
        ...section,
        order: sections.length + index
      })));
    }

    return sections.sort((a, b) => a.order - b.order);
  }

  /**
   * Generate policy title
   */
  private async generateTitle(template: PolicyTemplate, variables: Record<string, any>): Promise<string> {
    const companyName = variables.company_name || '[Company Name]';
    return `${template.name} - ${companyName}`;
  }

  /**
   * Replace variables in content
   */
  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `[${key}]`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return result;
  }

  /**
   * Determine if a section should be enhanced with AI
   */
  private shouldEnhanceSection(sectionType: string, content: string): boolean {
    // Enhance sections that are likely to need customization
    const enhanceableSections = ['procedures', 'responsibilities', 'compliance'];
    return enhanceableSections.includes(sectionType) && content.length < 200;
  }

  /**
   * Enhance section content using AI
   */
  private async enhanceSectionContent(
    sectionType: string, 
    content: string, 
    request: PolicyGenerationRequest
  ): Promise<string> {
    try {
      const prompt = this.buildEnhancementPrompt(sectionType, content, request);
      
      // Call AI service to enhance content
      const response = await fetch('/api/policy-bot/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tone: request.tone,
          language: request.language,
          sectionType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enhance content');
      }

      const data = await response.json();
      return data.enhancedContent || content;
    } catch (error) {
      console.error('Content enhancement failed:', error);
      return content; // Return original content if enhancement fails
    }
  }

  /**
   * Build AI prompt for content enhancement
   */
  private buildEnhancementPrompt(
    sectionType: string, 
    content: string, 
    request: PolicyGenerationRequest
  ): string {
    const tone = request.tone;
    const language = request.language;
    
    return `Enhance the following ${sectionType} section for a business policy. 
    
    Original content: "${content}"
    
    Requirements:
    - Tone: ${tone}
    - Language: ${language}
    - Make it more comprehensive and professional
    - Include specific details and examples
    - Maintain consistency with business policy standards
    
    Enhanced content:`;
  }

  /**
   * Generate legal disclaimer
   */
  private async generateLegalDisclaimer(
    template: PolicyTemplate, 
    variables: Record<string, any>
  ): Promise<string> {
    const companyName = variables.company_name || '[Company Name]';
    
    return `This policy is provided by ${companyName} for informational purposes only. 
    This policy does not constitute legal advice and should not be relied upon as such. 
    Please consult with legal counsel to ensure compliance with applicable laws and regulations. 
    ${companyName} reserves the right to modify this policy at any time with appropriate notice.`;
  }

  /**
   * Generate review notes
   */
  private async generateReviewNotes(
    sections: PolicySectionContent[], 
    template: PolicyTemplate
  ): Promise<string[]> {
    const notes: string[] = [];
    
    // Check for potential issues
    if (sections.length < 5) {
      notes.push('Consider adding more sections for comprehensive coverage');
    }
    
    if (template.legalLanguage) {
      notes.push('Legal review recommended due to legal language requirements');
    }
    
    const wordCount = this.calculateWordCount(sections);
    if (wordCount < 500) {
      notes.push('Policy may be too brief - consider adding more detail');
    }
    
    return notes;
  }

  /**
   * Get section title
   */
  private getSectionTitle(sectionType: string): string {
    const titles: Record<string, string> = {
      purpose: 'Purpose',
      scope: 'Scope',
      definitions: 'Definitions',
      policy_statement: 'Policy Statement',
      procedures: 'Procedures',
      responsibilities: 'Responsibilities',
      compliance: 'Compliance',
      exceptions: 'Exceptions',
      effective_date: 'Effective Date',
      review_schedule: 'Review Schedule'
    };
    
    return titles[sectionType] || sectionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Check if section is required
   */
  private isSectionRequired(sectionType: string): boolean {
    const requiredSections = ['purpose', 'scope', 'policy_statement'];
    return requiredSections.includes(sectionType);
  }

  /**
   * Generate unique policy ID
   */
  private generatePolicyId(organizationId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `policy_${organizationId}_${timestamp}_${random}`;
  }

  /**
   * Calculate total word count
   */
  private calculateWordCount(sections: PolicySectionContent[]): number {
    return sections.reduce((total, section) => {
      return total + section.content.split(/\s+/).length;
    }, 0);
  }
} 