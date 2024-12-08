import { useState, useCallback } from 'react';

// Import the token estimator
import AITokenEstimator from '../utils/ai-token-estimator';

// Define interface for token estimation result
interface TokenEstimationResult {
  baseTokens: number;
  estimatedTokens: number;
  complexity: 'simple' | 'moderate' | 'complex';
  complexityFactors: string[];
  modelComparison: Record<string, number>;
}

// Custom hook for token estimation
export const useAITokenEstimation = () => {
  const [tokenEstimator] = useState(new AITokenEstimator());

  const estimateTokens = useCallback((text: string): TokenEstimationResult => {
    // Perform token estimation
    const tokenEstimation = tokenEstimator.estimateTokens(text);
    const complexityAnalysis = tokenEstimator.analyzeTokenComplexity(text);
    const modelComparison = tokenEstimator.compareModelTokenization(text);

    return {
      baseTokens: tokenEstimation.baseTokens,
      estimatedTokens: tokenEstimation.estimatedTokens,
      complexity: complexityAnalysis.complexity,
      complexityFactors: complexityAnalysis.factors,
      modelComparison
    };
  }, [tokenEstimator]);

  return { estimateTokens };
};