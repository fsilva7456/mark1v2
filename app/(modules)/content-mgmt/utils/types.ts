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
  special_considerations: string;
  content_plan_text: string;
  created_at: string;
}

export interface SaveContentPlanResponse {
  status: 'success' | 'error';
  error?: string;
  data?: ContentPlanData;
  message?: string;
}

export interface SocialMediaPost {
  id: string;
  strategy_id: string;
  content_plan_id: string;
  post_text: string;
  post_type: string;
  post_status: 'draft' | 'scheduled' | 'posted';
  scheduled_date?: string;
  posted_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaPostResponse {
  status: 'success' | 'error';
  error?: string;
  data?: SocialMediaPost;
  message?: string;
}

export interface SocialMediaPostsResponse {
  status: 'success' | 'error';
  error?: string;
  data?: SocialMediaPost[];
  message?: string;
} 