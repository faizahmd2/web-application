import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(request: Request) {
  const { image } = await request.json()
  
  try {
    // Remove data:image/[type];base64, prefix
    const base64Image = image.split(',')[1]
    
    const results = await hf.objectDetection({
      model: 'facebook/detr-resnet-50',
      data: Buffer.from(base64Image, 'base64'),
    })
    
    return Response.json(results)
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}