import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('No messages provided');
    }

    // Prepare contents for Gemini
    const contents = [];
    
    // Merge consecutive messages with the same role
    for (const msg of messages) {
      const role = (msg.role === 'model' || msg.role === 'assistant') ? 'model' : 'user';
      const text = msg.content;
      
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += "\n\n" + text;
      } else {
        contents.push({ role, parts: [{ text }] });
      }
    }

    // Ensure the conversation starts with 'user'
    if (contents.length > 0 && contents[0].role === 'model') {
       contents.shift();
    }
    
    // If empty after shift, can't continue
    if (contents.length === 0) {
       throw new Error("Conversation must contain at least one user message.");
    }

    // Ensure the conversation ends with 'user' (as input for generation) is NOT REQUIRED for generateContent?
    // Actually, usually it is [User, Model, User] -> Generate -> Model.
    // If it is [User, Model], and we call generate, it tries to continue from Model?
    // It's safest to ensure the last part is effectively the user prompt.
    // However, if the user sends [User, Model] in the array, do they want a continuation?
    // We'll assume the client sends the prompt as the last message.

    // Helper to call Gemini API
    const callGemini = async (modelName: string, chatContents: any[]) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        contents: chatContents,
        generationConfig: { temperature: 0.7 }
      };
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        // Return explicit error object so we can decide to retry
        return { success: false, status: res.status, error: json.error || res.statusText };
      }
      
      if (json.candidates && json.candidates[0].content && json.candidates[0].content.parts[0].text) {
         return { success: true, text: json.candidates[0].content.parts[0].text };
      }
      
      return { success: false, status: 200, error: "No text in response" };
    };

    // Attempt 1: Gemini 3 Flash Preview (Top Priority)
    console.log("Attempting to use model: gemini-3-flash-preview");
    let result = await callGemini('gemini-3-flash-preview', contents);

    // Attempt 2: Gemini 3 Pro Preview
    if (!result.success) {
      console.warn(`gemini-3-flash-preview failed (${result.status}). Retrying with gemini-3-pro-preview...`);
      result = await callGemini('gemini-3-pro-preview', contents);
    }
    
    // Attempt 3: Gemini 2.5 Flash (Stable Fallback)
    if (!result.success) {
      console.warn(`gemini-3-pro-preview failed (${result.status}). Retrying with gemini-2.5-flash...`);
      result = await callGemini('gemini-2.5-flash', contents);
    }

    if (!result.success) {
       console.error("All compatible models failed. Final error:", result.error);
       throw new Error(`Gemini API Error: ${JSON.stringify(result.error)}`);
    }

    return new Response(JSON.stringify({ text: result.text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Function Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
