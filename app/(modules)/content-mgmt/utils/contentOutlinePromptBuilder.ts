/**
 * Utility for building prompts for content outline generation
 */

export interface ContentPlanInput {
  strategyName: string;
  businessType: string;
  objectives: string;
  audience: string;
  differentiation: string;
  specialConsiderations: string;
}

/**
 * Builds a prompt for generating a 3-week content plan based on strategy information
 * and any special considerations for the upcoming weeks
 * 
 * @param {ContentPlanInput} input - The strategy data and special considerations
 * @returns {string} The formatted prompt for the LLM
 */
export function buildContentOutlinePrompt(input: ContentPlanInput): string {
  return `
You are a professional content strategist creating a 3-week content plan for a business based on their strategy and upcoming considerations.

STRATEGY INFORMATION:
- Business Type: ${input.businessType}
- Business Objectives: ${input.objectives}
- Target Audience: ${input.audience}
- Key Differentiation: ${input.differentiation}

SPECIAL CONSIDERATIONS FOR NEXT 3 WEEKS:
${input.specialConsiderations || "No special considerations provided."}

Based on the above information, create a comprehensive 3-week content plan with the following:

1. An overall content theme for the 3-week period
2. For each week (Week 1, 2, and 3):
   - A specific theme/focus for the week
   - A clear objective for that week's content
   - Recommended content types (e.g., blog posts, social media, videos)
   - Key messages to emphasize
   - Any timing considerations from the special considerations

FORMAT YOUR RESPONSE LIKE THIS:
# 3-Week Content Plan for ${input.strategyName}

## Overall Theme: [Insert overall theme]

### Week 1
- **Theme**: [Week 1 theme]
- **Objective**: [Week 1 objective]
- **Content Types**: [Recommended content types]
- **Key Messages**: [Key messages for Week 1]
- **Special Timing Considerations**: [Any special timing notes]

### Week 2
- **Theme**: [Week 2 theme]
- **Objective**: [Week 2 objective]
- **Content Types**: [Recommended content types]
- **Key Messages**: [Key messages for Week 2]
- **Special Timing Considerations**: [Any special timing notes]

### Week 3
- **Theme**: [Week 3 theme]
- **Objective**: [Week 3 objective]
- **Content Types**: [Recommended content types]
- **Key Messages**: [Key messages for Week 3]
- **Special Timing Considerations**: [Any special timing notes]

IMPORTANT: Be specific and practical. Focus on actionable content ideas that align with the strategy and consider any special timing needs mentioned.
`.trim();
} 