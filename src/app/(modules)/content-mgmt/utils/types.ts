/**
 * Types for content management module
 */

export interface FullStrategyDetails {
  id: string;
  name: string;
  user_id: string;
  business_type: string;
  objectives: string;
  audience: string;
  differentiation: string;
  matrix_content: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPlanData {
  id: string;
  strategy_id: string;
  user_id?: string;
  title?: string;
  special_considerations: string;
  content_plan_text: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface SaveContentPlanResponse {
  status: 'success' | 'error';
  error?: string;
  data?: ContentPlanData;
  message?: string;
} 