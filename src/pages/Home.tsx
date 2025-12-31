import { useUserStore } from '../store/useUserStore';

const Home = () => {
  const { tokens, addTokens, spendTokens, restoreEnergy, useEnergy } = useUserStore();

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>👋 ยินดีต้อนรับสู่โรงกลั่นความรู้</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        ระบบจัดการความรู้แบบ Gamification ที่จะเปลี่ยนงานน่าเบื่อให้เป็นเกม
      </p>

      {/* พื้นที่ทดสอบระบบ (Dev Tools) */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '10px', 
        border: '1px solid #ddd' 
      }}>
        <h3>🛠️ Dev Control Panel (ทดสอบระบบ)</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          
          <button 
            onClick={() => addTokens(50)}
            style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            + รับ 50 Tokens
          </button>

          <button 
            onClick={() => {
              if(!spendTokens(100)) alert('เงินไม่พอโว้ย!');
            }}
            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            - จ่าย 100 Tokens
          </button>

          <button 
            onClick={() => useEnergy(10)}
            style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            ⚡ ใช้ 10 Energy
          </button>

          <button 
            onClick={() => restoreEnergy()}
            style={{ padding: '8px 16px', background: '#eab308', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            ♻️ รี Energy เต็ม
          </button>

        </div>
      </div>
    </div>
  );
};

export default Home;