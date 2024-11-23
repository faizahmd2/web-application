"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Type, Wand2 } from "lucide-react"

export default function FillMask() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [completeSentences, setCompleteSentences] = useState<string[]>([])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setSuggestions([])
    setCompleteSentences([])
  }

  const insertMask = () => {
    setText(text + ' [MASK] ')
  }

  const getPredictions = async () => {
    if (!text || !text.includes('[MASK]')) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai-vision/fill-mask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      
      // Create complete sentences with top 3 predictions
      const sentences = data.slice(0, 3).map((prediction: any) => 
        text.replace('[MASK]', prediction.token_str)
      )
      setCompleteSentences(sentences)
      setSuggestions(data)
    } catch (error) {
      console.error('Error getting predictions:', error)
      setSuggestions([])
      setCompleteSentences([])
    }
    setLoading(false)
  }

  const gradients = [
    'from-purple-600 to-indigo-600',
    'from-pink-600 to-purple-600',
    'from-indigo-600 to-blue-600',
    'from-blue-600 to-cyan-600',
    'from-cyan-600 to-teal-600'
  ]

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {/* <Input
              value={text}
              onChange={handleTextChange}
              placeholder="Enter text with [MASK] token..."
              className="flex-1 border-2 focus:border-purple-400 transition-colors"
            /> */}
            <Textarea
              value={text}
              className="flex-1 border-2 focus:border-purple-400 transition-colors" 
              placeholder="Type your message here." 
              onChange={handleTextChange}   />
          </div>
          <div className='text-center'>
            <Button 
              onClick={insertMask}
              variant="outline"
              className="border-2 hover:bg-purple-50"
            >
              <Type className="mr-2 h-4 w-4" />
              Insert [MASK]
            </Button>
          </div>

          <Button
            onClick={getPredictions}
            disabled={!text.includes('[MASK]') || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {loading ? "Generating..." : "Get Predictions"}
          </Button>

          {completeSentences.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Complete Sentences</h3>
              <div className="space-y-2">
                {completeSentences.map((sentence, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg bg-gradient-to-r ${gradients[index]} text-white shadow-md`}
                  >
                    {sentence}
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">All Suggestions</h3>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setText(text.replace('[MASK]', suggestion.token_str))}
                    className={`text-left border-2 hover:bg-${index % 2 ? 'purple' : 'indigo'}-50`}
                  >
                    <span className="font-medium">{suggestion.token_str}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({(suggestion.score * 100).toFixed(1)}%)
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}