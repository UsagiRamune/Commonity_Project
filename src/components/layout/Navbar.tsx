import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore'; // Import store มาใช้
import { Coins, Zap } from 'lucide-react'; // เอาไอคอนสวยๆ มาใช้

const Navbar = () => {
  // ดึงค่าจาก Store มาใช้
  const { tokens, energy, maxEnergy } = useUserStore();

  const navStyle = {
    padding: '0.8rem 1.5rem',
    background: '#1a1a1a', // ปรับสีให้เข้มขึ้นดู Modern
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #333'
  } as const; // as const ช่วยเรื่อง Type ของ CSS

  const linkGroupStyle = {
    display: 'flex',
    gap: '20px'
  };

  const linkStyle = {
    color: '#e0e0e0',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.95rem'
  };

  const statusGroupStyle = {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    background: '#333',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '0.9rem'
  };

  return (
    <nav style={navStyle}>
      {/* โลโก้ + เมนู */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#4ade80' }}>
          KnowledgeRefinery
        </span>
        <div style={linkGroupStyle}>
          <Link to="/" style={linkStyle}>🏠 Dashboard</Link>
          <Link to="/analysis" style={linkStyle}>🤖 Work</Link>
          <Link to="/game" style={linkStyle}>🎮 Play</Link>
        </div>
      </div>

      {/* ส่วนแสดงสถานะ (HUD) */}
      <div style={statusGroupStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fbbf24' }}>
          <Coins size={18} /> 
          <span>{tokens}</span>
        </div>
        <div style={{ width: '1px', height: '15px', background: '#555' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#60a5fa' }}>
          <Zap size={18} />
          <span>{energy}/{maxEnergy}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;