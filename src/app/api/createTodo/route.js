import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req) {
  try {
    const openai = new OpenAI();
    const { topic, numberTodos } = await req.json(); 


    const systemPrompt = `
    You are a to-do list creator. Given a topic, create exactly ${numberTodos} to-dos.
    Each to-do should include:
    - A concise title.
    - A concise description (no more than one sentence).
    - A due date in the format 'YYYY-MM-DD', which must be a future date (i.e., a date after today for example today is 2024-09-13 the date has to be after that). Make sure the date format is 'YYYY-MM-DD'.
    - An expected time to complete the task in hours (as a number), which should be reasonable for the task and generally between 5 and 120 minutes.
    The to-dos should be relevant to the provided topic.
    Return the result in the following JSON format:
    {
      "todos": [
        {
          "title": "concise title",
          "description": "concise description",
          "dueDate": "YYYY-MM-DD",
          "expectedTime": "number of minutes"
        }
      ]
    }
  `;


    const stream = new ReadableStream({
      async start(controller) {
        try {

          const completion = await openai.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Topic: ${topic}` } 
            ],
            model: "gpt-3.5-turbo",
            stream: true,  
          });


          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || '';  
            controller.enqueue(new TextEncoder().encode(text));   
          }

          controller.close();
        } catch (error) {
          controller.error(error);  
        }
      }
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error('Error generating todos:', error);
    return NextResponse.json({ error: 'Failed to generate todos' }, { status: 500 });
  }
}
