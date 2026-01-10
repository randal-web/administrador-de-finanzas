import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AIChat({ stats, transactions, goals, debts, subscriptions, expectedIncome }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: '¡Hola! Soy tu asistente financiero personal. Puedo analizar tus gastos, darte consejos sobre tus metas o ayudarte a planificar tu presupuesto. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const buildContextPrompt = () => {
    // Summarize recent transactions
    const recentTx = transactions.slice(0, 15).map(t => 
      `- ${t.date.split('T')[0]}: ${t.description} ($${t.amount}) [${t.type}] - ${t.category}`
    ).join('\n');

    // Summarize debts
    const debtsSummary = debts.map(d => 
      `- ${d.name}: Deuda original $${d.amount}, Pendiente $${d.remainingAmount || d.amount}`
    ).join('\n');

    // Summarize goals
    const goalsSummary = goals.map(g => 
      `- ${g.name}: Llevas $${g.currentAmount} de $${g.targetAmount}`
    ).join('\n');

    return `
      Actúa como un experto asesor financiero personal amable y conciso.
      
      Aquí tienes el contexto financiero actual del usuario:
      
      **Resumen General:**
      - Balance Actual: $${stats.balance}
      - Ingresos del mes: $${stats.income}
      - Gastos del mes: $${stats.expenses}
      - Ahorros: $${stats.savings}
      
      **Deudas Activas:**
      ${debtsSummary || 'No hay deudas registradas.'}
      
      **Metas de Ahorro:**
      ${goalsSummary || 'No hay metas activas.'}
      
      **Transacciones Recientes:**
      ${recentTx}
      
      **Instrucciones:**
      1. Responde preguntas sobre estos datos o da consejos generales.
      2. Sé breve y directo. Usa formato Markdown para listas o negritas.
      3. Si detectas gastos altos en algo, sugiérelo amablemente.
      4. Si el usuario pregunta "qué puedo hacer", analiza su balance y deudas.
      5. Responde siempre en Español.
    `;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = buildContextPrompt();
      
      const payload = {
        messages: [
            ...messages.filter(m => m.role !== 'system'),
            { role: 'user', content: `${systemPrompt}\n\nPregunta del usuario: ${userMessage}` } 
            // Note: Simplification to reduce payload logic on server. Ideally system prompt is separate.
            // But for Gemini simple chat history, we can just append context to the last message 
            // OR prepend a system message. Let's try prepending context to the LAST message sent to the Function.
        ]
      };

      // Better approach for history:
      // 1. Initial greeting (model) - keep
      // 2. User/Model history - keep
      // 3. New User message - needs context injection? 
      // Actually, standard practice for simple RAG: Insert context in the latest prompt or as a system instruction.
      // Since 'startChat' is stateful on the server (Deno) only if we keep the instance which we don't (serverless),
      // we must send full history every time.
      // So let's construct the array to send:
      
      const messagesToSend = messages.map(m => ({ role: m.role, content: m.content }));
      
      // Inject context into the *new* user message to ensure the model sees it "now"
      messagesToSend.push({ 
        role: 'user', 
        content: `${systemPrompt}\n\nPregunta del usuario: ${userMessage}` 
      });

      const { data, error } = await supabase.functions.invoke('chat-finances', {
        body: { messages: messagesToSend }
      });

      if (error) throw error;
      
      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (error) {
        console.error('Error invoking function:', error);
        setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, hubo un error al conectar con la IA.' }]);
        // More detailed error for debugging if needed, but keep UI clean
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isOpen 
            ? 'bg-slate-800 text-white rotate-90 dark:bg-neutral-700' 
            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <Bot size={28} />}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-[400px] bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-neutral-800 z-50 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 h-[600px] max-h-[80vh]' 
            : 'opacity-0 scale-95 translate-y-10 pointer-events-none h-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
               <Sparkles size={18} className="text-white" />
             </div>
             <div>
               <h3 className="font-bold text-slate-800 dark:text-white text-sm">Finanzas AI</h3>
               <p className="text-xs text-slate-500 dark:text-neutral-400">Powered by Gemini</p>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-neutral-900 scroll-smooth">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in`}
            >
              <div 
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 rounded-tl-sm border border-slate-200 dark:border-neutral-700'
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 text-inherit [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-xs text-slate-400 font-medium">Pensando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-neutral-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-sm transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-200 dark:shadow-none"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
