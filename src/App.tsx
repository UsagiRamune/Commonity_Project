import { useEffect } from 'react'; // 1. import useEffect
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';

// Import หน้าที่เราเพิ่งสร้าง

import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Game from './pages/Game';

import { debugModels } from './services/gemini';

function App() {
  useEffect(() => {
    // เรียกใช้ฟังก์ชันเช็คของ
    debugModels();
  }, []);
  
  return (
    <BrowserRouter>
      {/* Navbar จะอยู่ทุกหน้า เพราะอยู่นอก Routes */}
      <Navbar />
      
      {/* ส่วนเนื้อหาที่จะเปลี่ยนไปตาม URL */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;