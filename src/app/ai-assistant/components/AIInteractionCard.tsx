'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAITokenEstimation } from '../../hooks/useAITokenEstimation';

type AIModel = 'openai-gpt' | 'claude-anthropic' | 'gemini-google';

const AIInteractionCard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai-gpt');
  const [tokenEstimation, setTokenEstimation] = useState<any>(null);

  const { estimateTokens } = useAITokenEstimation();

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    const estimation = estimateTokens(prompt);
    setTokenEstimation(estimation);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Choose AI Model</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select 
            value={selectedModel}
            onValueChange={(value: AIModel) => setSelectedModel(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai-gpt">OpenAI GPT</SelectItem>
              <SelectItem value="claude-anthropic">Claude Anthropic</SelectItem>
              <SelectItem value="gemini-google">Google Gemini</SelectItem>
            </SelectContent>
          </Select>

          <Textarea 
            placeholder="Enter your prompt for token estimation"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[150px]"
          />

          <Button 
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className="w-full"
          >
            Estimate Tokens
          </Button>

          {tokenEstimation && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold mb-2">Token Estimation Results</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>Base Tokens:</strong> {tokenEstimation.baseTokens}
                </div>
                <div>
                  <strong>Estimated Tokens:</strong> {tokenEstimation.estimatedTokens}
                </div>
                <div>
                  <strong>Complexity:</strong> {tokenEstimation.complexity}
                </div>
                <div>
                  <strong>Complexity Factors:</strong> 
                  {tokenEstimation.complexityFactors.join(', ') || 'None'}
                </div>
              </div>

              {/* Model Comparison */}
              {/* <div className="mt-4">
                <h4 className="font-semibold">Model Token Comparison</h4>
                {Object.entries(tokenEstimation.modelComparison).map(([model, tokens]:any[]) => (
                  <div key={model} className="flex justify-between">
                    <span>{model}</span>
                    <span>{tokens} tokens</span>
                  </div>
                ))}
              </div> */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInteractionCard;