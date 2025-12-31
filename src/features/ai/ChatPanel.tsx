import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageCircle, Minimize2 } from 'lucide-react';
import { sendMessageToGemini } from '../../services/gemini';
import { useUserStore } from '../../store/useUserStore';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

// รับ Props เพื่อให้หน้า Analysis สั่งเปิด/ปิดได้
interface ChatPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  notification?: string | null; // ข้อความแจ้งเตือน (เช่น "วิเคราะห์เสร็จแล้ว!")
}

const ChatPanel = ({ isOpen, setIsOpen, notification }: ChatPanelProps) => {
  const { useEnergy } = useUserStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'bot', text: 'สวัสดีจ้า! รินะเอง มีข้อมูลอะไรให้ช่วยกลั่นมั้ย? ✨' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false); // เอาไว้สั่งสั่นเรียกร้องความสนใจ

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Effect: ถ้ามี Notification เข้ามา ให้สั่นดุ๊กดิ๊ก
  useEffect(() => {
    if (notification && !isOpen) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 1000); // สั่น 1 วิ
      return () => clearTimeout(timer);
    }
  }, [notification, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const hasEnergy = useEnergy(1); 
    if (!hasEnergy) {
      alert("Energy หมดแล้ว! ไปพักก่อนนะ");
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const replyText = await sendMessageToGemini(input);
    
    const botMsg: Message = { id: Date.now() + 1, role: 'bot', text: replyText };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  // CSS Animation สำหรับการสั่น (Inject style ใน Component เลยง่ายดี)
  const shakeAnimation = `
    @keyframes shake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-5px) rotate(-5deg); }
      50% { transform: translateX(5px) rotate(5deg); }
      75% { transform: translateX(-5px) rotate(-5deg); }
      100% { transform: translateX(0); }
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.5) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;

  return (
    <>
      <style>{shakeAnimation}</style>
      
      <div style={{ 
        position: 'fixed', 
        bottom: '30px', 
        right: '30px', 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px'
      }}>

        {/* 1. ส่วน Quote Bubble (โชว์ตอนปิดChat หรือมีแจ้งเตือน) */}
        {!isOpen && (notification || isShaking) && (
          <div style={{
            background: '#2563eb',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '20px',
            borderBottomRightRadius: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '5px',
            animation: 'popIn 0.3s ease-out',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            maxWidth: '200px'
          }}>
            {notification || "Rina อยู่ตรงนี้นะ มาคุยได้! 👋"}
          </div>
        )}

        {/* 2. ตัวหน้าต่าง Chat (ตอนเปิด) */}
        {isOpen && (
          <div style={{ 
            width: '350px', 
            height: '500px', 
            background: 'white', 
            borderRadius: '15px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
            border: '1px solid #ddd',
            display: 'flex', 
            flexDirection: 'column',
            animation: 'popIn 0.2s ease-out',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ 
              padding: '15px', background: '#2563eb', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot size={20} />
                <span style={{ fontWeight: 'bold' }}>Rina (AI Assistant)</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <Minimize2 size={20} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', background: '#f8fafc' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: msg.role === 'user' ? '#3b82f6' : 'white',
                  color: msg.role === 'user' ? 'white' : '#333',
                  padding: '10px 15px',
                  borderRadius: '15px',
                  borderTopRightRadius: msg.role === 'user' ? '2px' : '15px',
                  borderTopLeftRadius: msg.role === 'bot' ? '2px' : '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  fontSize: '0.95rem'
                }}>
                  {msg.text}
                </div>
              ))}
              {isLoading && <div style={{ color: '#666', fontSize: '0.8rem', marginLeft: '10px' }}>กำลังพิมพ์...</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '15px', background: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="พิมพ์ข้อความ..."
                style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
              />
              <button onClick={handleSend} disabled={isLoading} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 3. ปุ่ม Toggle (Floating Button) */}
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#2563eb', 
              color: 'white', 
              border: 'none', 
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.4)',
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              animation: isShaking ? 'shake 0.5s ease-in-out infinite' : 'none', // สั่นเมื่อมี notification
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Bot size={32} />
            {/* จุดแดงแจ้งเตือน */}
            {notification && (
              <div style={{ 
                position: 'absolute', top: '0', right: '0', 
                width: '15px', height: '15px', background: '#ef4444', 
                borderRadius: '50%', border: '2px solid white' 
              }} />
            )}
          </button>
        )}

      </div>
    </>
  );
};

export default ChatPanel;