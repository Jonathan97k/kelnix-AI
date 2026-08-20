import { AIContentRequest, AIContentResponse } from '../../types';
import { postJson } from '../api/apiClient';

export const contentGenerationService = {
  async generateContent(request: AIContentRequest): Promise<AIContentResponse> {
    try {
      return await postJson<AIContentResponse>('/api/generate-content', {
        topic: request.topic,
        contentType: request.contentType,
        targetPlatform: request.targetPlatform,
        targetAudience: request.targetAudience,
        tone: request.tone,
        businessContext: request.businessContext,
      });
    } catch (error: any) {
      console.error('Error in contentGenerationService.generateContent:', error);
      throw error;
    }
  },
};
