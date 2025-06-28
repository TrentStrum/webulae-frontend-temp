/**
 * Advanced Prompt Service
 * 
 * Handles dynamic prompt generation with variables, conditional logic,
 * and template processing for advanced AI customization.
 */

import { 
  SystemPrompt, 
  PromptVariable, 
  PromptCondition, 
  PromptTemplate,
  PromptAnalytics 
} from '@/app/types/systemPrompt.types';

export interface PromptContext {
  user_id: string;
  organization_id: string;
  user_role: string;
  user_permissions: string[];
  current_time: string;
  user_preferences: Record<string, any>;
  conversation_history: any[];
  system_settings: Record<string, any>;
  [key: string]: any;
}

export interface PromptEvaluationResult {
  should_include: boolean;
  reason: string;
  confidence: number;
}

export class AdvancedPromptService {
  private static instance: AdvancedPromptService;
  private variableCache = new Map<string, any>();
  private templateCache = new Map<string, PromptTemplate>();

  static getInstance(): AdvancedPromptService {
    if (!AdvancedPromptService.instance) {
      AdvancedPromptService.instance = new AdvancedPromptService();
    }
    return AdvancedPromptService.instance;
  }

  /**
   * Build a dynamic system prompt with variables and conditions
   */
  static buildDynamicPrompt(
    prompts: SystemPrompt[],
    context: PromptContext,
    options: {
      include_variables?: boolean;
      include_conditions?: boolean;
      max_tokens?: number;
      priority_order?: boolean;
    } = {}
  ): string {
    const {
      include_variables = true,
      include_conditions = true,
      max_tokens = 4000,
      priority_order = true
    } = options;

    // Sort prompts by priority if requested
    const sortedPrompts = priority_order 
      ? prompts.sort((a, b) => (b.priority || 0) - (a.priority || 0))
      : prompts;

    const promptParts: string[] = [];
    let currentTokens = 0;

    for (const prompt of sortedPrompts) {
      if (!prompt.is_active) continue;

      // Check conditions if enabled
      if (include_conditions && prompt.conditions) {
        const evaluation = this.evaluateConditions(prompt.conditions, context);
        if (!evaluation.should_include) {
          continue;
        }
      }

      let processedContent = prompt.content;

      // Process variables if enabled
      if (include_variables && prompt.variables) {
        processedContent = this.processVariables(processedContent, prompt.variables, context);
      }

      // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
      const estimatedTokens = Math.ceil(processedContent.length / 4);
      
      if (currentTokens + estimatedTokens > max_tokens) {
        break;
      }

      promptParts.push(processedContent);
      currentTokens += estimatedTokens;
    }

    return promptParts.join('\n\n');
  }

  /**
   * Evaluate conditions for a prompt
   */
  static evaluateConditions(
    conditions: PromptCondition[],
    context: PromptContext
  ): PromptEvaluationResult {
    if (!conditions || conditions.length === 0) {
      return { should_include: true, reason: 'No conditions specified', confidence: 1.0 };
    }

    let result = true;
    let logicalOperator: 'AND' | 'OR' = 'AND';
    const reasons: string[] = [];

    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(context, condition.field);
      const conditionResult = this.evaluateSingleCondition(condition, fieldValue);
      
      if (condition.logical_operator) {
        logicalOperator = condition.logical_operator;
      }

      if (!conditionResult.result) {
        reasons.push(`Condition failed: ${condition.field} ${condition.operator} ${condition.value}`);
      }

      if (logicalOperator === 'AND') {
        result = result && conditionResult.result;
      } else if (logicalOperator === 'OR') {
        result = result || conditionResult.result;
      }
    }

    return {
      should_include: result,
      reason: reasons.length > 0 ? reasons.join('; ') : 'All conditions met',
      confidence: result ? 1.0 : 0.0
    };
  }

  /**
   * Evaluate a single condition
   */
  private static evaluateSingleCondition(
    condition: PromptCondition,
    fieldValue: any
  ): { result: boolean; confidence: number } {
    const { operator, value } = condition;

    switch (operator) {
      case 'equals':
        return { result: fieldValue === value, confidence: 1.0 };
      
      case 'not_equals':
        return { result: fieldValue !== value, confidence: 1.0 };
      
      case 'contains':
        if (typeof fieldValue === 'string' && typeof value === 'string') {
          return { result: fieldValue.toLowerCase().includes(value.toLowerCase()), confidence: 1.0 };
        }
        if (Array.isArray(fieldValue)) {
          return { result: fieldValue.includes(value), confidence: 1.0 };
        }
        return { result: false, confidence: 0.0 };
      
      case 'not_contains':
        if (typeof fieldValue === 'string' && typeof value === 'string') {
          return { result: !fieldValue.toLowerCase().includes(value.toLowerCase()), confidence: 1.0 };
        }
        if (Array.isArray(fieldValue)) {
          return { result: !fieldValue.includes(value), confidence: 1.0 };
        }
        return { result: true, confidence: 1.0 };
      
      case 'greater_than':
        return { result: Number(fieldValue) > Number(value), confidence: 1.0 };
      
      case 'less_than':
        return { result: Number(fieldValue) < Number(value), confidence: 1.0 };
      
      case 'exists':
        return { result: fieldValue !== undefined && fieldValue !== null, confidence: 1.0 };
      
      case 'not_exists':
        return { result: fieldValue === undefined || fieldValue === null, confidence: 1.0 };
      
      default:
        return { result: false, confidence: 0.0 };
    }
  }

  /**
   * Process variables in prompt content
   */
  static processVariables(
    content: string,
    variables: PromptVariable[],
    context: PromptContext
  ): string {
    let processedContent = content;

    for (const variable of variables) {
      const value = this.resolveVariable(variable, context);
      const placeholder = `{{${variable.name}}}`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return processedContent;
  }

  /**
   * Resolve a variable value from context
   */
  private static resolveVariable(variable: PromptVariable, context: PromptContext): any {
    // Try to get from context first
    const contextValue = this.getNestedValue(context, variable.name);
    if (contextValue !== undefined) {
      return contextValue;
    }

    // Return default value if available
    if (variable.default_value !== undefined) {
      return variable.default_value;
    }

    // Return empty string for required string variables
    if (variable.required && variable.type === 'string') {
      return '';
    }

    // Return appropriate default based on type
    switch (variable.type) {
      case 'string': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'array': return [];
      case 'object': return {};
      default: return '';
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Validate prompt variables against context
   */
  static validatePromptVariables(
    variables: PromptVariable[],
    context: PromptContext
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const variable of variables) {
      const value = this.resolveVariable(variable, context);
      
      if (variable.required && (value === undefined || value === null || value === '')) {
        errors.push(`Required variable '${variable.name}' is missing or empty`);
        continue;
      }

      if (variable.validation) {
        const validationErrors = this.validateVariable(variable, value);
        errors.push(...validationErrors);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a single variable
   */
  private static validateVariable(variable: PromptVariable, value: any): string[] {
    const errors: string[] = [];
    const { validation } = variable;

    if (!validation) return errors;

    if (typeof value === 'string') {
      if (validation.min_length && value.length < validation.min_length) {
        errors.push(`Variable '${variable.name}' must be at least ${validation.min_length} characters`);
      }
      
      if (validation.max_length && value.length > validation.max_length) {
        errors.push(`Variable '${variable.name}' must be no more than ${validation.max_length} characters`);
      }
      
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push(`Variable '${variable.name}' does not match required pattern`);
        }
      }
    }

    if (validation.enum && !validation.enum.includes(value)) {
      errors.push(`Variable '${variable.name}' must be one of: ${validation.enum.join(', ')}`);
    }

    return errors;
  }

  /**
   * Generate prompt analytics
   */
  static generatePromptAnalytics(
    promptId: string,
    usageData: any[]
  ): PromptAnalytics {
    const totalUsage = usageData.length;
    const responseTimes = usageData.map(d => d.response_time || 0).filter(t => t > 0);
    const satisfactionScores = usageData.map(d => d.satisfaction_score || 0).filter(s => s > 0);
    const successCount = usageData.filter(d => d.success === true).length;

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const averageSatisfaction = satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      : 0;

    const successRate = totalUsage > 0 ? (successCount / totalUsage) * 100 : 0;

    // Analyze common failures
    const failures = usageData
      .filter(d => d.success === false)
      .map(d => d.error_message || 'Unknown error')
      .reduce((acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const commonFailures = Object.entries(failures)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error);

    return {
      prompt_id: promptId,
      usage_count: totalUsage,
      average_response_time: averageResponseTime,
      user_satisfaction_score: averageSatisfaction,
      success_rate: successRate,
      common_failures: commonFailures,
      last_used: usageData.length > 0 ? usageData[0].created_at : '',
      performance_metrics: {
        token_usage: 0, // Would need to be calculated from actual usage
        response_quality_score: averageSatisfaction,
        context_relevance_score: 0, // Would need to be calculated
        user_feedback_score: averageSatisfaction
      }
    };
  }

  /**
   * Create a prompt template from existing prompt
   */
  static createTemplateFromPrompt(
    prompt: SystemPrompt,
    examples: PromptExample[] = []
  ): PromptTemplate {
    return {
      id: `template_${prompt.id}`,
      name: `${prompt.prompt_name} Template`,
      description: `Template based on ${prompt.prompt_name}`,
      category: prompt.category,
      template: prompt.content,
      variables: prompt.variables || [],
      examples,
      tags: prompt.tags || [],
      usage_count: prompt.usage_count || 0,
      rating: 0
    };
  }

  /**
   * Test a prompt with sample inputs
   */
  static async testPrompt(
    prompt: SystemPrompt,
    testInputs: string[],
    context: PromptContext
  ): Promise<{ input: string; output: string; success: boolean; error?: string }[]> {
    const results = [];

    for (const input of testInputs) {
      try {
        const processedPrompt = this.buildDynamicPrompt([prompt], context);
        // In a real implementation, this would call the AI service
        const output = `Test output for: ${input}`; // Mock output
        
        results.push({
          input,
          output,
          success: true
        });
      } catch (error) {
        results.push({
          input,
          output: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
} 