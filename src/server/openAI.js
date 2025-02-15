import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getChatCompletion(messages) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: 'system',
          content: 'When mentioning interesting or important concepts, wrap them in <span> tags. For example: The <span>environmental conditions</span> affect the <span>ecosystem</span>.'
        },
        ...messages.map(msg => ({
          role: msg.user_id === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }))
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    return content.split('\n').map(line => line.trim()).filter(line => line !== '');
  } catch (error) {
    console.error('Error in getChatCompletion:', error);
    throw error;
  }
}
