import express from 'express';
import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    // Get the Google AI model
    const aiModel = google(model || 'gemini-2.5-flash', {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Stream the response
    const result = streamText({
      model: aiModel,
      messages: convertToModelMessages(messages),
      system: 'You are a helpful assistant that can answer questions and help with tasks',
    });

    // Get the Web API Response
    const response = result.toUIMessageStreamResponse();

    // Copy headers from Web Response to Express response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Set status code
    res.status(response.status);

    // Stream the body
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    
    res.end();
    // --- MOCK STREAMING RESPONSE FOR TESTING PURPOSES ---
    // const response = "Hello! This is a streaming response from JavaScript. I'm simulating an AI assistant that responds to your message.";
    
    // // Set headers for Server-Sent Events
    // res.setHeader('Content-Type', 'text/event-stream');
    // res.setHeader('Cache-Control', 'no-cache');
    // res.setHeader('Connection', 'keep-alive');

    // // Helper to send SSE data
    // const sendData = (data) => {
    //   res.write(`data: ${JSON.stringify(data)}\n\n`);
    // };

    // // 1. Start stream
    // sendData({ type: "start" });
    // await new Promise(resolve => setTimeout(resolve, 10));

    // // // 2. Start step
    // // sendData({ type: "start-step" });
    // // await new Promise(resolve => setTimeout(resolve, 10));

    // // 3. Text start
    // sendData({ type: "text-start", id: "0" });
    // await new Promise(resolve => setTimeout(resolve, 10));

    // // 4. Stream text word by word
    // const words = response.split(" ");
    // for (const word of words) {
    //   sendData({ 
    //     type: "text-delta", 
    //     id: "0", 
    //     delta: word + " " 
    //   });
    //   // Wait 50ms before next word
    //   await new Promise(resolve => setTimeout(resolve, 50));
    // }

    // // 5. Text end
    // sendData({ type: "text-end", id: "0" });
    // await new Promise(resolve => setTimeout(resolve, 10));

    // // // 6. Finish step
    // // sendData({ type: "finish-step" });
    // // await new Promise(resolve => setTimeout(resolve, 10));

    // sendData({ type: "data-chat",
    //   // ✅ Add custom metadata here
    //   data: {
    //     chatId: "chat_123456",
    //     title: "New conversation about AI"
    //   }  });
    // await new Promise(resolve => setTimeout(resolve, 10));

    // // 7. Finish
    // sendData({ type: "finish", finishReason: "stop"});
    // await new Promise(resolve => setTimeout(resolve, 10));

    // // 8. Done
    // res.write(`data: [DONE]\n\n`);
    
    // res.end();

  } catch (error) {
    console.error('Error in chat route:', error);
    
    // Check if headers were already sent
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    } else {
      res.end();
    }
  }
});

export default router;
