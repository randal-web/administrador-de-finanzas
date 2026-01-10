import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in Supabase Secrets');
    }

    const { messages } = await req.json();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // The frontend sends the history. The first message usually contains the system context.
    // We can just iterate and construct the history for the chat model.
    // Note: Gemini SDK expects history in a specific format { role: 'user' | 'model', parts: [{ text: '...' }] }
    
    // We assume 'messages' comes in as [{ role: 'user'|'model', content: '...' }]
    // The last message is the new User message, but the SDK uses sending the message to a chat instance with previous history.
    
    const lastMessage = messages[messages.length - 1];
    const historyMessages = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user', // Ensure strictly 'model' or 'user'
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: historyMessages,
    });

    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
