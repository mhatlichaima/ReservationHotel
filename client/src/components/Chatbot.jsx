// components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const Chatbot = () => {
  const { navigate, rooms } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Bonjour ! Je suis votre assistant personnel pour trouver la chambre parfaite. Comment puis-je vous aider aujourd'hui ?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'greeting'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState({
    step: 'greeting',
    collectedData: {}
  });
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fermer le chat quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatContainerRef.current && 
          !chatContainerRef.current.contains(event.target) &&
          !event.target.closest('.chatbot-button')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // [Garder toute la logique de conversation identique...]
  const getConversationalResponse = (userMessage, context) => {
    const message = userMessage.toLowerCase();
    
    if (context.step === 'greeting') {
      if (message.includes('bonjour') || message.includes('salut') || message.includes('hello')) {
        return {
          text: "😊 Bonjour ! Ravie de faire votre connaissance. Souhaitez-vous réserver une chambre d'hôtel pour un prochain séjour ?",
          nextStep: 'discovery',
          context: { ...context.collectedData }
        };
      }
    }

    if (context.step === 'discovery' || context.step === 'greeting') {
      if (message.includes('oui') || message.includes('recherche') || message.includes('chambre') || 
          message.includes('hôtel') || message.includes('séjour')) {
        return {
          text: "✨ Parfait ! Pour vous trouver la chambre idéale, pourriez-vous me dire dans quelle ville souhaitez-vous séjourner ?",
          nextStep: 'asking_city',
          context: { ...context.collectedData, lookingForRoom: true }
        };
      }
      
      if (message.includes('non') || message.includes('pas maintenant') || message.includes('plus tard')) {
        return {
          text: "😊 D'accord, n'hésitez pas à me contacter quand vous serez prêt à planifier votre séjour. Je serai là pour vous aider !",
          nextStep: 'greeting',
          context: {}
        };
      }
    }

    if (context.step === 'asking_city') {
      const cities = ['paris', 'london', 'rome', 'barcelone', 'new york', 'tokyo'];
      const foundCity = cities.find(city => message.includes(city));
      
      if (foundCity) {
        return {
          text: `🏙️ ${foundCity.charAt(0).toUpperCase() + foundCity.slice(1)} ! Excellente destination. Maintenant, pour quel type de chambre cherchez-vous ?`,
          nextStep: 'asking_room_type',
          context: { ...context.collectedData, city: foundCity }
        };
      } else if (message) {
        return {
          text: `🌍 "${userMessage}" semble être une belle destination ! Quel type de chambre souhaitez-vous dans cette ville ?`,
          nextStep: 'asking_room_type',
          context: { ...context.collectedData, city: userMessage }
        };
      }
    }

    if (context.step === 'asking_room_type') {
      const roomTypes = {
        'simple': 'Single Bed',
        'double': 'Double Bed', 
        'luxe': 'Luxury Room',
        'familial': 'Family Suite',
        'suite': 'Family Suite'
      };
      
      const foundType = Object.keys(roomTypes).find(type => message.includes(type));
      
      if (foundType) {
        const roomType = roomTypes[foundType];
        return {
          text: `🛏️ ${roomType} ! Excellent choix. Maintenant, quel est votre budget approximatif par nuit ? Par exemple : économique (moins de 100€), confort (100-200€), ou premium (plus de 200€) ?`,
          nextStep: 'asking_budget',
          context: { ...context.collectedData, roomType }
        };
      } else if (message) {
        return {
          text: `🛏️ Je vois que vous cherchez "${userMessage}". Pourriez-vous me préciser votre budget par nuit ? Par exemple : économique, confortable, ou premium ?`,
          nextStep: 'asking_budget',
          context: { ...context.collectedData, roomType: userMessage }
        };
      }
    }

    if (context.step === 'asking_budget') {
      const budgetRanges = {
        'économique': '0-100',
        'economique': '0-100',
        'petit budget': '0-100',
        'confort': '100-200', 
        'confortable': '100-200',
        'moyen': '100-200',
        'premium': '200-300',
        'luxe': '200-300',
        'grand budget': '200-300'
      };
      
      const foundBudget = Object.keys(budgetRanges).find(budget => message.includes(budget));
      
      if (foundBudget) {
        const budgetRange = budgetRanges[foundBudget];
        const newContext = { 
          ...context.collectedData, 
          budget: budgetRange,
          readyForResults: true
        };
        
        return {
          text: `💰 ${foundBudget.charAt(0).toUpperCase() + foundBudget.slice(1)} ! Très bien. Je recherche les meilleures options correspondant à vos critères...`,
          nextStep: 'showing_results',
          context: newContext
        };
      } else if (message.match(/\d+/)) {
        const numbers = message.match(/\d+/g);
        if (numbers && numbers.length >= 1) {
          const budget = parseInt(numbers[0]);
          const range = budget <= 100 ? '0-100' : budget <= 200 ? '100-200' : '200-300';
          const newContext = { 
            ...context.collectedData, 
            budget: range,
            readyForResults: true
          };
          
          return {
            text: `💰 ${budget}€ par nuit ! Parfait. Je recherche les meilleures options dans cette gamme de prix...`,
            nextStep: 'showing_results', 
            context: newContext
          };
        }
      } else if (message) {
        const newContext = { 
          ...context.collectedData, 
          budget: 'flexible',
          readyForResults: true
        };
        
        return {
          text: `💰 Je note vos préférences de budget. Laissez-moi rechercher les meilleures options pour vous...`,
          nextStep: 'showing_results',
          context: newContext
        };
      }
    }

    if (context.step === 'showing_results') {
      if (message.includes('oui') || message.includes('montre') || message.includes('voir') || message.includes('détails')) {
        const searchParams = new URLSearchParams();
        if (context.collectedData.city) {
          searchParams.set('destination', context.collectedData.city);
        }
        if (context.collectedData.roomType) {
          searchParams.set('roomType', context.collectedData.roomType);
        }
        if (context.collectedData.budget) {
          const [min, max] = context.collectedData.budget.split('-');
          searchParams.set('minPrice', min);
          searchParams.set('maxPrice', max);
        }

        return {
          text: `🎉 Parfait ! Je vous redirige vers nos meilleures chambres ${context.collectedData.roomType} à ${context.collectedData.city}. Vous allez être redirigé vers la page des résultats...`,
          nextStep: 'redirecting',
          context: { ...context.collectedData, redirecting: true }
        };
      }
      
      if (message.includes('non') || message.includes('pas maintenant')) {
        return {
          text: "😊 D'accord, je garde vos critères en mémoire. N'hésitez pas à me dire quand vous serez prêt à voir les résultats !",
          nextStep: 'ready_to_show',
          context: { ...context.collectedData }
        };
      }
      
      if (context.collectedData.readyForResults) {
        return {
          text: "🔍 J'ai rassemblé toutes les informations ! Souhaitez-vous que je vous montre maintenant les chambres disponibles correspondant à vos critères ?",
          nextStep: 'showing_results',
          context: { ...context.collectedData }
        };
      }
    }

    if (message.includes('merci')) {
      return {
        text: "😊 Je vous en prie ! C'est un plaisir de vous aider. Y a-t-il autre chose que je puisse faire pour vous ?",
        nextStep: context.step,
        context: context.collectedData
      };
    }

    if (message.includes('au revoir') || message.includes('bye') || message.includes('à bientôt')) {
      return {
        text: "👋 Au revoir ! Merci de votre visite et à très bientôt pour votre prochain séjour !",
        nextStep: 'greeting',
        context: {}
      };
    }

    if (message.includes('aide') || message.includes('que peux-tu')) {
      return {
        text: `🤖 Bien sûr ! Je peux vous aider à :
• Trouver la chambre parfaite selon vos besoins
• Comparer les prix et les services
• Découvrir les meilleures destinations
• Vous guider dans le processus de réservation

Souhaitez-vous commencer une recherche de chambre ?`,
        nextStep: 'discovery',
        context: {}
      };
    }

    return {
      text: "🤔 Je veux m'assurer de bien comprendre vos besoins. Souhaitez-vous que je vous aide à trouver une chambre d'hôtel ? Nous pouvons discuter de la destination, du type de chambre et de votre budget.",
      nextStep: 'discovery',
      context: {}
    };
  };

  const handleQuickAction = (action) => {
    let response = {};
    
    switch(action.type) {
      case 'start_search':
        response = {
          text: "✨ Super ! Commençons par trouver votre destination de rêve. Dans quelle ville souhaitez-vous séjourner ?",
          nextStep: 'asking_city',
          context: { lookingForRoom: true }
        };
        break;
      case 'help':
        response = {
          text: `🤖 Avec plaisir ! Je suis ici pour vous accompagner dans toute votre recherche :
• Je peux vous aider à trouver la chambre idéale
• Vous suggérer des destinations
• Vous informer sur les services disponibles
• Vous guider pas à pas

Voulez-vous commencer une recherche ?`,
          nextStep: 'discovery',
          context: {}
        };
        break;
      default:
        response = {
          text: "Comment puis-je vous aider aujourd'hui ?",
          nextStep: 'greeting',
          context: {}
        };
    }

    addMessage(action.text, 'user');
    
    setIsTyping(true);
    setTimeout(() => {
      addMessage(response.text, 'bot');
      setConversationContext({
        step: response.nextStep,
        collectedData: response.context
      });
      setIsTyping(false);
    }, 1000);
  };

  const addMessage = (text, sender, type = 'text') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    addMessage(inputMessage, 'user');
    const userMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getConversationalResponse(userMessage, conversationContext);
      
      addMessage(response.text, 'bot');
      
      setConversationContext({
        step: response.nextStep,
        collectedData: response.context
      });

      if (response.nextStep === 'redirecting') {
        setTimeout(() => {
          const searchParams = new URLSearchParams();
          const { city, roomType, budget } = response.context;
          
          if (city) searchParams.set('destination', city);
          if (roomType) searchParams.set('roomType', roomType);
          if (budget && budget !== 'flexible') {
            const [min, max] = budget.split('-');
            searchParams.set('minPrice', min);
            searchParams.set('maxPrice', max);
          }

          navigate(`/rooms?${searchParams.toString()}`);
          setIsOpen(false);
          window.scrollTo(0, 0);
        }, 2000);
      }

      if (response.nextStep === 'showing_results' && 
          response.context.city && 
          response.context.roomType && 
          response.context.readyForResults) {
        
        setTimeout(() => {
          const { city, roomType, budget } = response.context;
          let budgetText = '';
          if (budget === '0-100') budgetText = 'économique';
          else if (budget === '100-200') budgetText = 'confort';
          else if (budget === '200-300') budgetText = 'premium';
          
          addMessage(
            `🎯 Parfait ! J'ai trouvé des chambres ${roomType.toLowerCase()} à ${city} dans la gamme ${budgetText}. Souhaitez-vous voir les résultats maintenant ?`,
            'bot'
          );
        }, 1000);
      }

      setIsTyping(false);
    }, 1500);
  };

  const handleShowResults = () => {
    const { city, roomType, budget } = conversationContext.collectedData;
    
    if (city && roomType) {
      addMessage("Montrez-moi les résultats maintenant", 'user');
      
      setIsTyping(true);
      setTimeout(() => {
        addMessage("🎉 Parfait ! Je vous redirige vers nos meilleures options...", 'bot');
        
        setTimeout(() => {
          const searchParams = new URLSearchParams();
          if (city) searchParams.set('destination', city);
          if (roomType) searchParams.set('roomType', roomType);
          if (budget && budget !== 'flexible') {
            const [min, max] = budget.split('-');
            searchParams.set('minPrice', min);
            searchParams.set('maxPrice', max);
          }

          navigate(`/rooms?${searchParams.toString()}`);
          setIsOpen(false);
          window.scrollTo(0, 0);
        }, 1500);
        
        setIsTyping(false);
      }, 1000);
    }
  };

  const QuickActions = () => {
    const hasCompleteCriteria = conversationContext.collectedData.city && 
                               conversationContext.collectedData.roomType;

    return (
      <div className="space-y-3 mt-4">
        {hasCompleteCriteria ? (
          <>
            <p className="text-xs text-gray-500 font-medium">Prêt à voir les résultats ?</p>
            <button
              onClick={handleShowResults}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2 w-full justify-center"
            >
              🎯 Voir les chambres correspondantes
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-500 font-medium">Démarrez la conversation :</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickAction({ 
                  type: 'start_search', 
                  text: 'Je veux chercher une chambre' 
                })}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm transition-colors border border-blue-200 flex items-center gap-2"
              >
                🔍 Chercher une chambre
              </button>
            </div>
          </>
        )}

        <div className="pt-2">
          <p className="text-xs text-gray-400 mb-2">Suggestions de discussion :</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Quelles villes proposez-vous ?",
              "Quels types de chambres ?", 
              "Avez-vous des promotions ?"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs transition-colors border border-green-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Bouton flottant du chatbot */}
      <button
        onClick={() => setIsOpen(true)}
        className="chatbot-button fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Ouvrir l'assistant de réservation"
      >
        <div className="relative">
          <span className="text-white text-lg">💬</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Assistant de réservation
        </div>
      </button>

      {/* FENÊTRE CHAT SANS OVERLAY - Position fixe en bas à droite */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className="fixed bottom-20 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistant Réservation</h3>
                <p className="text-blue-100 text-xs">
                  {conversationContext.collectedData.city ? 
                    `Recherche: ${conversationContext.collectedData.city}` : 
                    'En ligne'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-500"
              aria-label="Fermer le chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-3 py-2 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Écrit...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Actions rapides */}
          <div className="px-4 pb-2 bg-white border-t border-gray-100">
            <QuickActions />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 border border-gray-300 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;