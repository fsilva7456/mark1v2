/**
 * Interface for strategy form data
 */
export interface StrategyFormData {
  name: string;
  businessType: string;
  objectives: string;
  audience: string;
  differentiation: string;
}

/**
 * Builds a comprehensive prompt for an LLM based on strategy form inputs
 * @param formData - The strategy form data provided by the user
 * @returns A formatted prompt string ready to be sent to an LLM
 */
export function buildStrategyPrompt(formData: StrategyFormData): string {
  const { name, businessType, objectives, audience, differentiation } = formData;
  
  return `
You are a strategic business consultant helping ${name} develop a comprehensive business strategy.

BUSINESS INFORMATION:
- Business Type: ${businessType}
- Primary Objectives: ${objectives}
- Target Audience: ${audience}
- Key Differentiators: ${differentiation}

Based on the information provided, please create a detailed strategic plan that includes:

1. EXECUTIVE SUMMARY
   - Provide a brief overview of the current business situation and the key strategic recommendations.

2. MARKET ANALYSIS
   - Analyze the market potential for this type of business
   - Identify potential growth areas and market gaps
   - Suggest market positioning based on the differentiators mentioned

3. TARGET AUDIENCE STRATEGY
   - Develop detailed audience personas based on the information provided
   - Suggest optimal channels to reach this audience
   - Recommend messaging strategies that would resonate with this audience

4. COMPETITIVE ADVANTAGE PLAN
   - Elaborate on how to leverage the mentioned differentiators
   - Suggest additional ways to stand out from competitors
   - Recommend how to communicate these advantages effectively

5. IMPLEMENTATION ROADMAP
   - Provide a 30-60-90 day action plan
   - Suggest key metrics to track for measuring success
   - Recommend resources needed for successful implementation

6. POTENTIAL CHALLENGES AND SOLUTIONS
   - Identify potential obstacles based on the business type and objectives
   - Suggest proactive solutions for each challenge

Please format your response in a clear, structured manner using headings, bullet points, and numbered lists where appropriate. The strategic plan should be comprehensive but practical, focusing on actionable recommendations rather than theoretical concepts.
`.trim();
} 