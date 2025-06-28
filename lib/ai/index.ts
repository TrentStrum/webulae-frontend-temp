import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return result.data[0].embedding;
}

export async function streamChat(question: string, context: string): Promise<ReadableStream<Uint8Array>> {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that answers questions based ONLY on the provided context. Do not suggest premium features, upgrades, or additional services. If the information is not in the context, simply say you don't have that information.

Context:
${context}`,
      },
      { role: 'user', content: question },
    ],
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });
}
