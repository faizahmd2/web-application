'use client';

import React from 'react';
import AIInteractionCard from './components/AIInteractionCard';

export default function AITokenEstimationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AI Prompt Token Estimate
      </h1>
      <AIInteractionCard />
    </div>
  );
}