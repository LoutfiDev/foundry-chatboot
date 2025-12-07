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
