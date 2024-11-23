
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ObjectDetection from '@/app/ai-vision/components/ObjectDetection'
import FillMask from '@/app/ai-vision/components/FillMask'

export default function AIVision() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          AI Vision Tool
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Upload images for details or experiment with text predictions.
        </p>
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="object-detection" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger
                value="object-detection"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Object Detection
              </TabsTrigger>
              <TabsTrigger
                value="fill-mask"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Fill Mask
              </TabsTrigger>
            </TabsList>
            <TabsContent value="object-detection">
              <ObjectDetection />
            </TabsContent>
            <TabsContent value="fill-mask">
              <FillMask />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}