import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(request: Request) {
    const { text } = await request.json()
    
    try {
      const results = await hf.fillMask({
        model: 'bert-base-uncased',
        inputs: text,
      })
      
      return Response.json(results)
    } catch (error) {
      console.error('Error:', error)
      return Response.json({ error: 'Failed to get predictions' }, { status: 500 })
    }
}