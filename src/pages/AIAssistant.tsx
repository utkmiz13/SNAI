// @ts-nocheck
// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Languages, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  typing?: boolean;
}

const GEMINI_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const COLONY_SYSTEM_CONTEXT = `You are "Sharda Nagar AI" — the specialized smart assistant for Sharda Nagar Vistar Colony (also known as Green Valley Residency), located in Sector 12, Bijnor, Uttar Pradesh.

COLONY & SOCIETY INFORMATION:
- Society Name: Green Valley Residency / Sharda Nagar Vistar
- Location: Sector 12, Piyush Saxena Road, Bijnor, UP 226014
- Management: Resident Welfare Association (RWA)

EMERGENCY SOS SYSTEM (CRITICAL):
- Emergency Hub: Users can access the "Emergency" page for immediate help.
- Ambulance: 108
- Police: 100
- Fire Brigade: 101
- Security Gate: 9000011111
- Nearby Hospital: 0522-1234567
- High-Priority Residents (for emergency coordination):
  * Rahul Sharma (A-101): B+, Asthma Patient
  * Priya Verma (B-203): O+, Senior Citizen
  * Neha Gupta (A-402): AB+, Pregnant
  * Rohan Das (D-110): O-, Diabetic

SHOPS & SERVICES:
1. Piyush General Store — Block-45, 1st Floor (Grocery, Dairy)
2. Mohan Sahu General Store — Block-39, GF (Vegetables, Grocery)
3. Mishra Provisional Store — Block-20, GF (Provisions)
4. Manohar Lal Snacks — Block-6 | 📞 9044908000 (10 AM-10 PM)
5. Gudoo Gupta Fast Food — Block-14 | 📞 7398554566 (11 AM-11 PM)

CORE RULES:
1. STRICT FOCUS: Answer ONLY questions about Sharda Nagar Vistar / Green Valley Residency. 
2. NO BULLSHIT: If a user asks about anything unrelated (world news, celebrity gossip, generic coding, general knowledge), politely say: "I am specialized only for Sharda Nagar Vistar. I cannot answer unrelated questions."
3. EMERGENCY FIRST: For any medical or security mention, prioritize giving the Emergency Hub numbers (108, 100, etc.).
4. LANGUAGE: Respond in the language the user uses (Hindi or English).
5. TONE: Professional, community-focused, and helpful.`;

const QUICK_QUESTIONS = [
  { q: 'Shops in the colony?', icon: '🏪' },
  { q: 'How to raise a complaint?', icon: '🔧' },
  { q: 'Fast food near Block-6?', icon: '🍕' },
  { q: 'Colony address?', icon: '📍' },
  { q: 'How to pre-approve a guest?', icon: '👤' },
];

async function callGemini(userMessage: string, chatHistory: { role: string; parts: { text: string }[] }[]) {
  const contents = [
    { role: 'user', parts: [{ text: COLONY_SYSTEM_CONTEXT }] },
    { role: 'model', parts: [{ text: "Understood! I'm Sharda Nagar AI, ready to help residents of Sharda Nagar Vistar Colony. I'll only answer questions related to our colony." }] },
    ...chatHistory,
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response. Please try again.';
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: '🏡 Namaste! I\'m Sharda Nagar AI — your smart colony assistant.\n\nAsk me about:\n• 🏪 Colony shops & contacts\n• 🔧 Raising complaints\n• 👤 Visitor pre-approval\n• 📍 Colony address & directions\n\nI answer ONLY about Sharda Nagar Vistar Colony. Type your question below! (हिंदी में भी पूछ सकते हैं)',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isHindi, setIsHindi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addTypingIndicator = () => {
    const typingMsg: Message = { id: 'typing', sender: 'ai', text: '...', timestamp: new Date(), typing: true };
    setMessages(prev => [...prev, typingMsg]);
  };

  const removeTypingIndicator = () => {
    setMessages(prev => prev.filter(m => m.id !== 'typing'));
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    addTypingIndicator();

    try {
      const aiResponse = await callGemini(messageText, chatHistory);
      
      removeTypingIndicator();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // Update chat history for context
      setChatHistory(prev => [
        ...prev.slice(-8), // Keep last 8 exchanges
        { role: 'user', parts: [{ text: messageText }] },
        { role: 'model', parts: [{ text: aiResponse }] }
      ]);
    } catch (error: any) {
      removeTypingIndicator();
      
      let fallbackResponse = '';
      const lower = messageText.toLowerCase();
      
      if (lower.includes('shop') || lower.includes('store') || lower.includes('दुकान')) {
        fallbackResponse = '🏪 Shops in Sharda Nagar Vistar:\n\n**General Stores:**\n• Piyush General Store – Block-45, 1st Floor\n• Mohan Sahu General Store – Block-39, GF\n• Mishra Provisional Store – Block-20, GF\n\n**Fast Food:**\n• Manohar Lal – Block-6 Chauraha | 📞 9044908000\n• Gudoo Gupta – Block-14 | 📞 7398554566';
      } else if (lower.includes('complaint') || lower.includes('शिकायत')) {
        fallbackResponse = '🔧 To raise a complaint:\n\n1. Go to the **Complaints** page\n2. Click "+ Raise Complaint"\n3. Select category (Water/Electricity/Security/Other)\n4. Add title and description\n5. Submit — you\'ll get a ticket number\n\nTrack your complaint status in real-time!';
      } else if (lower.includes('address') || lower.includes('location') || lower.includes('पता')) {
        fallbackResponse = '📍 Sharda Nagar Vistar Colony\n\nPiyush Saxena Road, Bijnor,\nUttar Pradesh 226014\n\n🗺️ Google Maps: https://share.google/Igs5k6C0Oz4usCdv2';
      } else if (lower.includes('visitor') || lower.includes('guest') || lower.includes('otp')) {
        fallbackResponse = '👤 Visitor Pre-Approval:\n\n1. Go to **Visitors** page\n2. Click "Pre-Approve Guest"\n3. Enter guest name, purpose, date\n4. An OTP will be generated\n5. Share the 6-digit OTP with your guest\n\nThe gate security will verify the OTP on arrival!';
      } else {
        fallbackResponse = isHindi 
          ? '🙏 मुझे क्षमा करें, इस समय AI सर्विस से कनेक्ट नहीं हो पाया। कृपया इन विषयों के बारे में पूछें: दुकानें, शिकायत, पता, विज़िटर।'
          : '⚠️ Currently offline. I can help with: Colony shops & contacts, How to complain, Visitor management, Colony address. Try asking about any of these!';
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackResponse,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[750px] card overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              Sharda Nagar AI
              <span className="flex items-center gap-1 text-xs font-normal bg-green-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Online
              </span>
            </h2>
            <p className="text-blue-100 text-xs">Powered by Google Gemini • Colony-specific AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHindi(!isHindi)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-medium transition-all"
          >
            <Languages size={14} />
            {isHindi ? 'English' : 'हिंदी'}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[hsl(var(--muted))]/20">
        
        {/* Quick Questions - shown only at start */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center font-medium">Quick questions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.q)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full text-xs font-medium hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all shadow-sm"
                >
                  {q.icon} {q.q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                  : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
              }`}>
                {msg.sender === 'user' 
                  ? (profile?.username?.[0]?.toUpperCase() || 'U')
                  : <Sparkles size={14} />
                }
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'chat-bubble-user'
                  : 'chat-bubble-ai'
              }`}>
                {msg.typing ? (
                  <div className="flex items-center gap-1 py-1">
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isHindi ? 'अपना सवाल यहाँ टाइप करें...' : 'Ask about the colony...'}
            disabled={loading}
            className="input-field flex-1"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 text-center">
          🤖 AI answers are about Sharda Nagar Vistar colony only. For emergencies, call 112.
        </p>
      </div>
    </div>
  );
}
