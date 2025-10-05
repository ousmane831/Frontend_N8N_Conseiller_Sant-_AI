import { useState, useRef, useEffect } from 'react';
import { Send, Heart } from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('healthAdvisorMessages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(
        parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('healthAdvisorMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5678/webhook-test/health-agent/ask',
        { question: inputValue }
      );

      const aiText =
        response?.data?.['Format Réponse']?.trim() ||
        '⚠️ Désolé, je n’ai pas pu récupérer la réponse. Réessayez plus tard.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erreur lors de l’appel au webhook:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "⚠️ Je n'ai pas pu traiter votre demande. Réessayez plus tard. Pour les cas graves, consultez un médecin.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('healthAdvisorMessages');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-emerald-50 flex flex-col items-center justify-center font-sans">
      <div className="backdrop-blur-xl bg-white/70 border border-emerald-200 shadow-2xl rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="py-6 bg-emerald-600/10 border-b border-emerald-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-emerald-600" fill="currentColor" />
            <h1 className="text-3xl font-bold text-emerald-800 drop-shadow-sm">
              Conseiller Santé AI
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Posez vos questions bien-être 🌿 Je vous écoute avec bienveillance.
          </p>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 underline"
            >
              Effacer l'historique
            </button>
          )}
        </header>

        {/* MESSAGES */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-white/60 to-emerald-50/40">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Heart className="w-12 h-12 mb-3 text-emerald-300 animate-pulse" />
              <p className="text-center max-w-sm">
                Commencez en posant une question sur la santé, le bien-être ou la nutrition 🌱
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} transition-all`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${
                  message.isUser
                    ? 'bg-emerald-500 text-white rounded-br-sm'
                    : 'bg-white/80 text-gray-800 border border-emerald-100 rounded-bl-sm'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isUser ? 'text-emerald-100' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/80 border border-emerald-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-emerald-200 bg-white/70 p-4 backdrop-blur-md"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-emerald-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md disabled:bg-gray-300"
            >
              <Send className="w-4 h-4" />
              <span className="hidden md:inline font-medium">Envoyer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
