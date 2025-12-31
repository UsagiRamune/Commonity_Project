import { useState, useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';
import { Upload, FileText, X, Sparkles, AlertCircle } from 'lucide-react';
import ChatPanel from '../features/ai/ChatPanel';
import { analyzeContent, feedContextToChat } from '../services/gemini';
import { saveHistory } from '../services/history';

const Analysis = () => {
  // Store
  const { useEnergy, addTokens } = useUserStore();

  // State สำหรับหน้าจอ
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State สำหรับ Chat Widget
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatNotification, setChatNotification] = useState<string | null>(null);

  const ENERGY_COST = 20;

  // 🔥 Effect: ถ้าเปิดแชทเมื่อไหร่ ให้ล้าง Notification ทิ้งทันที
  useEffect(() => {
    if (isChatOpen) {
      setChatNotification(null);
    }
  }, [isChatOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
      // Reset Chat state เมื่อเลือกไฟล์ใหม่
      setIsChatOpen(false);
      setChatNotification(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    // 1. เช็ค Energy
    const success = useEnergy(ENERGY_COST);
    if (!success) {
      setError("พลังงานไม่พอ! ไปพักผ่อนหรือเล่นเกมเติมพลังก่อนนะ");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log("🚀 1. เริ่มวิเคราะห์...");
      
      // 2. เรียก AI วิเคราะห์
      const prompt = "ช่วยสรุปเนื้อหาสำคัญของไฟล์นี้ให้หน่อย ขอแบบเป็นข้อๆ อ่านง่ายๆ";
      const aiResult = await analyzeContent(file, prompt);
      console.log("✅ 2. AI ตอบกลับมาแล้ว");

      // 3. บันทึกลง Database
      console.log("💾 3. กำลังบันทึกประวัติ...");
      await saveHistory({
        fileName: file.name,
        fileType: file.type,
        summary: aiResult,
        tokensEarned: 10
      });

      // 4. 🔥 ส่งบริบทให้ Rina (Connect Context)
      console.log("🧠 4. ป้อนข้อมูลเข้าสมอง Rina...");
      await feedContextToChat(`
        [บริบทงานปัจจุบัน]
        ชื่อไฟล์: ${file.name}
        สรุปเนื้อหา: ${aiResult}
        คำสั่ง: หากผู้ใช้ถามรายละเอียดเกี่ยวกับไฟล์นี้ ให้ใช้ข้อมูลข้างต้นในการตอบคำถาม
      `);

      // 5. Update UI & Rewards
      setResult(aiResult);
      addTokens(10);
      
      // แจ้งเตือนที่หัว Rina
      setChatNotification("วิเคราะห์เสร็จแล้ว! Rina รู้เรื่องไฟล์นี้แล้ว ถามต่อได้เลย ✨");

    } catch (err) {
      console.error("❌ Error:", err);
      setError("เกิดข้อผิดพลาดในการวิเคราะห์ (AI หรือ Database มีปัญหา)");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>🤖 AI Analysis Hub</h1>
        <p style={{ color: '#666' }}>
          โยนไฟล์เข้ามาเลย เดี๋ยว Rina จัดการให้ (ใช้ {ENERGY_COST} Energy)
        </p>
      </div>
      
      {/* Layout ตรงกลาง */}
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
           {/* ส่วน Upload (แสดงเมื่อยังไม่มีผลลัพธ์) */}
           {!result && (
            <div style={{ 
              border: '3px dashed #cbd5e1', 
              borderRadius: '20px', 
              padding: '60px 40px', 
              textAlign: 'center',
              background: '#f8fafc',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              
              {!file ? (
                <>
                  <div style={{ background: '#e0f2fe', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Upload size={40} color="#3b82f6" />
                  </div>
                  <h3>คลิกเพื่ออัปโหลดไฟล์</h3>
                  <p style={{ color: '#64748b' }}>รองรับไฟล์ภาพ (PNG/JPG) และข้อความ (.txt)</p>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  />
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <FileText size={64} color="#3b82f6" />
                  <div>
                    <strong style={{ fontSize: '1.2rem' }}>{file.name}</strong>
                    <p style={{ color: '#64748b' }}>{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      onClick={() => setFile(null)}
                      disabled={isProcessing}
                      style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '10px', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={isProcessing}
                      style={{
                        padding: '12px 30px',
                        background: isProcessing ? '#94a3b8' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      {isProcessing ? 'กำลังวิเคราะห์...' : <><Sparkles size={20} /> เริ่มวิเคราะห์</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* แจ้งเตือน Error */}
          {error && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {/* ส่วนแสดงผลลัพธ์ */}
          {result && (
            <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '100px' }}>
              <div style={{ background: '#dcfce7', padding: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={24} color="#166534" />
                <h3 style={{ margin: 0, color: '#166534' }}>Analysis Complete!</h3>
              </div>
              <div style={{ padding: '30px', whiteSpace: 'pre-line', lineHeight: '1.7', color: '#334155' }}>
                {result}
              </div>
              <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  onClick={() => { setFile(null); setResult(null); }} 
                  style={{ padding: '10px 25px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  ทำรายการใหม่
                </button>
              </div>
            </div>
          )}
      </div>

      {/* 🚀 Floating Chat Widget */}
      <ChatPanel 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
        notification={chatNotification} 
      />

    </div>
  );
};

export default Analysis;