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

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const COLONY_SYSTEM_CONTEXT = `You are "Sharda Nagar AI" — the smart assistant for Sharda Nagar Vistar Colony, Bijnor, Uttar Pradesh.

COLONY INFORMATION (Answer ONLY about this colony, refuse unrelated questions politely):

LOCATION:
- Name: Sharda Nagar Vistar Yojna
- Address: Piyush Saxena Road, Bijnor, Uttar Pradesh 226014
- Map: https://share.google/Igs5k6C0Oz4usCdv2

SHOPS IN COLONY:
1. Piyush General Store — 1st Floor, Block-45 (General grocery, dairy products, FMCG)
2. Mohan Sahu General Store — Ground Floor, Block-39 (Grocery, vegetables, oil) — Owner: Mohan Sahu
3. Mishra Provisional Store — Ground Floor, Block-20 (Provisions, spices, household items) — Owner: Mishra Ji

FOOD & SNACKS:
1. Manohar Lal Snacks — Manohar Chauraha, Block-6 | Phone: 9044908000 (Chaat, samosa, kachori, pav bhaji, lassi — 10 AM to 10 PM)
2. Gudoo Gupta Fast Food — Block-14 | Phone: 7398554566 (Biryani, rolls, snacks, Chinese — 11 AM to 11 PM)

HOME SERVICES:
- Suresh Electrician: 9123456789 (Block-8, 8 AM-8 PM)
- Ramesh Plumber: 9876543210 (Near Gate-2, 7 AM-9 PM)
- Dr. Sharma Clinic: 9988776655 (Block-3, 9 AM-9 PM)

APP FEATURES:
- Dashboard: Quick overview of notices, complaints
- Notices: Colony announcements with categories
- Complaints: Raise water, electricity, security issues
- Visitors: Pre-approve guests with OTP system
- Community: Forum, Events, Polls
- Local Services: Colony shops and service providers
- Documents: RWA rules, meeting minutes, bills
- Admin Panel: RWA management (admin only)

HOW TO COMPLAIN: Go to Complaints → Click "+ Raise Complaint" → Fill category and details → Submit

RULES:
1. Answer ONLY questions related to this colony, app features, local services, or residents' needs.
2. Be helpful, friendly, and speak in simple language.
3. If asked in Hindi, respond in Hindi.
4. Do not answer unrelated topics like politics, sports scores, general knowledge, etc.
5. Always recommend contacting security or calling 100 for emergencies.`;

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
