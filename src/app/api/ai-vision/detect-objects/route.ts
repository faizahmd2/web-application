import { HfInference } from '@huggingface/inference'
import { readFileSync } from 'fs'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(request: Request) {
  const { image } = await request.json()
  
  try {
    // Remove data:image/[type];base64, prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
    
    const results = await hf.objectDetection({
      model: 'facebook/detr-resnet-50',
      // data: readFileSync(image),
      data: arrayBuffer
    })
    
    return Response.json(results)
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}