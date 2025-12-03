import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessage,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  // NOTE: We receive the messages from the client.
  const messages: UIMessage[] = body.messages;

  // NOTE: We convert the messages to the format
  // expected by the model.
  const modelMessages: ModelMessage[] =
    convertToModelMessages(messages);

  // NOTE: We stream the text from the model.
  const streamTextResult = streamText({
    model: google('gemini-2.0-flash'),
    messages: modelMessages,
  });

  // NOTE: We convert the stream to the format
  // expected by the client.
  const stream = streamTextResult.toUIMessageStream();

  // NOTE: We create the response for the client.
  return createUIMessageStreamResponse({
    stream,
  });
};