"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Image as ImageIcon } from "lucide-react"

export default function ObjectDetection() {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setResults(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!image) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai-visoon/detect-objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      })
      const data = await response.json()
      setResults(data.length ? data : [
        { 
          label: "No objects detected",
          description: "The AI model couldn't identify specific objects in this image. This might be due to image quality, lighting, or objects being outside the model's training scope.",
          score: 1,
          box: { x: 0, y: 0, width: 1, height: 1 }
        }
      ])
    } catch (error) {
      console.error('Error analyzing image:', error)
      setResults([{
        label: "Analysis Error",
        description: "Failed to analyze the image. Please try again with a different image.",
        score: 1,
        box: { x: 0, y: 0, width: 1, height: 1 }
      }])
    }
    setLoading(false)
  }

  // Function to get contextual description for objects
  const getObjectDescription = (label: string, score: number) => {
    const descriptions: { [key: string]: string } = {
      person: "A human figure detected in the scene",
      car: "A motor vehicle identified in the image",
      dog: "A canine companion spotted in the frame",
      cat: "A feline friend observed in the scene",
      // Add more contextual descriptions as needed
    }
    return descriptions[label.toLowerCase()] || `A ${label.toLowerCase()} identified with high confidence`
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
          </label>
        </div>
          
        {image && (
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img
              src={image}
              alt="Uploaded"
              className="max-w-full h-auto"
            />
            {results?.map((result: any, index: number) => (
              <div
                key={index}
                className={`absolute border-2 ${
                  result.label === "No objects detected" || result.label === "Analysis Error"
                    ? "border-yellow-500 border-dashed"
                    : "border-purple-500"
                }`}
                style={{
                  left: `${result.box.x * 100}%`,
                  top: `${result.box.y * 100}%`,
                  width: `${result.box.width * 100}%`,
                  height: `${result.box.height * 100}%`,
                }}
              >
                <span className="absolute -top-6 left-0 bg-purple-600 text-white px-2 py-1 text-sm rounded-md shadow">
                  {result.label} ({(result.score * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={analyzeImage}
          disabled={!image || loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="mr-2 h-4 w-4" />
          )}
          {loading ? "Analyzing..." : "Analyze Image"}
        </Button>

        {results && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
            <div className="grid gap-4">
              {results.map((result: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    index % 2 === 0 ? 'bg-purple-50' : 'bg-indigo-50'
                  }`}
                >
                  <h4 className="font-semibold text-gray-800">
                    {result.label}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {getObjectDescription(result.label, result.score)}
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                        style={{ width: `${result.score * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}