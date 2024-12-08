
interface TokenEstimationModel {
  name: string;
  tokenizationMethod: 'character' | 'word' | 'bpe' | 'sentencepiece';
  averageTokenLength: number;
  tokenizationRules: {
    baseTokens: number;
    additionalRules: Array<{
      condition: (text: string) => boolean;
      tokenPenalty: number;
    }>;
  };
}

class AITokenEstimator {
  // Comprehensive token estimation models based on AI documentation
  private models: Record<string, TokenEstimationModel> = {
    'openai-gpt': {
      name: 'OpenAI GPT Models',
      tokenizationMethod: 'bpe',
      averageTokenLength: 4,
      tokenizationRules: {
        baseTokens: 1,
        additionalRules: [
          {
            condition: (text) => /```[\s\S]*```/.test(text),
            tokenPenalty: 1.5
          },
          {
            condition: (text) => /[A-Z]{3,}|[\[\]{}()]/.test(text),
            tokenPenalty: 1.2
          }
        ]
      }
    },
    'claude-anthropic': {
      name: 'Claude Models',
      tokenizationMethod: 'sentencepiece',
      averageTokenLength: 3.5,
      tokenizationRules: {
        baseTokens: 1,
        additionalRules: [
          {
            condition: (text) => text.split(/\s+/).length > 50,
            tokenPenalty: 1.3
          },
          {
            condition: (text) => /\b(function|class|interface)\b/.test(text),
            tokenPenalty: 1.4
          }
        ]
      }
    },
    'gemini-google': {
      name: 'Google Gemini Models',
      tokenizationMethod: 'sentencepiece',
      averageTokenLength: 4.2,
      tokenizationRules: {
        baseTokens: 1,
        additionalRules: [
          {
            condition: (text) => /[\u0080-\uFFFF]/.test(text),
            tokenPenalty: 1.6
          },
          {
            condition: (text) => /[\^∑∏∫]/.test(text),
            tokenPenalty: 1.5
          }
        ]
      }
    }
  };

  // Advanced token estimation algorithm
  estimateTokens(text: string, modelName: string = 'openai-gpt'): {
    baseTokens: number;
    estimatedTokens: number;
    tokenBreakdown: {
      baseCount: number;
      specialRulesPenalty: number;
    }
  } {
    const model = this.models[modelName] || this.models['openai-gpt'];
    
    let baseTokenCount: number;
    switch (model.tokenizationMethod) {
      case 'bpe':
        baseTokenCount = Math.ceil(text.length / model.averageTokenLength);
        break;
      case 'word':
        baseTokenCount = text.split(/\s+/).length;
        break;
      case 'sentencepiece':
        baseTokenCount = text.split(/[\s.,!?]+/).length;
        break;
      default:
        baseTokenCount = Math.ceil(text.length / 4); // Fallback method
    }

    let specialRulesPenalty = 1;
    for (const rule of model.tokenizationRules.additionalRules) {
      if (rule.condition(text)) {
        specialRulesPenalty *= rule.tokenPenalty;
      }
    }

    const estimatedTokens = Math.ceil(
      baseTokenCount * 
      model.tokenizationRules.baseTokens * 
      specialRulesPenalty
    );

    return {
      baseTokens: baseTokenCount,
      estimatedTokens,
      tokenBreakdown: {
        baseCount: baseTokenCount,
        specialRulesPenalty
      }
    };
  }

  analyzeTokenComplexity(text: string): {
    complexity: 'simple' | 'moderate' | 'complex';
    factors: string[];
  } {
    const complexityFactors: Array<{
      condition: (text: string) => boolean;
      factor: string;
    }> = [
      {
        condition: (text) => /\b(algorithm|mathematical|theoretical)\b/.test(text),
        factor: 'Technical Vocabulary'
      },
      {
        condition: (text) => text.split(/\s+/).length > 100,
        factor: 'Long-form Content'
      },
      {
        condition: (text) => /[A-Z]{3,}|[\[\]{}()]/.test(text),
        factor: 'Structured Content'
      },
      {
        condition: (text) => /[\u0080-\uFFFF]/.test(text),
        factor: 'Multilingual Content'
      }
    ];

    const detectedFactors = complexityFactors
      .filter(f => f.condition(text))
      .map(f => f.factor);

    let complexity: 'simple' | 'moderate' | 'complex';
    if (detectedFactors.length === 0) complexity = 'simple';
    else if (detectedFactors.length <= 2) complexity = 'moderate';
    else complexity = 'complex';

    return {
      complexity,
      factors: detectedFactors
    };
  }

  compareModelTokenization(text: string): Record<string, number> {
    return Object.keys(this.models).reduce((acc: any, modelName) => {
      acc[modelName] = this.estimateTokens(text, modelName).estimatedTokens;
      return acc;
    }, {});
  }
}

export default AITokenEstimator;