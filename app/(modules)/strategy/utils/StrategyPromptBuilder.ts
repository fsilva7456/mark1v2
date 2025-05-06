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
You are a strategic business consultant helping ${name} develop a comprehensive audience targeting strategy for their ${businessType}.

BUSINESS INFORMATION:
- Business Type: ${businessType}
- Primary Objectives: ${objectives}
- Target Audience: ${audience}
- Key Differentiators: ${differentiation}

Based on the information provided, create a strategic audience targeting matrix in the following format:

1. Create a 3x3 matrix with the following structure:
   - ROW HEADERS: Three specific audience segments or audiences with unmet needs. These should be derived from the target audience information provided.
   - COLUMN 1: The name and brief description of each audience segment
   - COLUMN 2: The key objective you have for each audience segment
   - COLUMN 3: The key message that will help achieve the objective for each audience

2. Format the output as a clean, well-structured matrix with clear headings and easily readable content.

3. Each audience segment should be distinct and specifically relevant to the ${businessType}.

4. The objectives should align with the overall business objectives provided but be tailored to each specific audience segment.

5. The key messages should leverage the business's differentiators and be compelling for the specific audience segment.

Please format your response as follows:

# AUDIENCE TARGETING MATRIX FOR ${businessType.toUpperCase()}

| AUDIENCE SEGMENT | KEY OBJECTIVE | KEY MESSAGE |
|------------------|---------------|-------------|
| [Audience 1 Name & Brief Description] | [Specific objective for this audience] | [Compelling message that will resonate with this audience] |
| [Audience 2 Name & Brief Description] | [Specific objective for this audience] | [Compelling message that will resonate with this audience] |
| [Audience 3 Name & Brief Description] | [Specific objective for this audience] | [Compelling message that will resonate with this audience] |

Below the matrix, provide a brief explanation of why these audience segments were selected and how they align with the overall business objectives.
`.trim();
} 