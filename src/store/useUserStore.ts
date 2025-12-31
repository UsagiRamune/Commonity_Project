import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. กำหนด Type ว่าข้อมูลเรามีอะไรบ้าง
interface UserState {
  tokens: number;
  energy: number;
  maxEnergy: number;
  level: number;
  storageUsed: number; // หน่วย MB
  maxStorage: number;  // หน่วย MB
  
  // Actions (ฟังก์ชันสำหรับแก้ค่า)
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean; // คืนค่า true ถ้าจ่ายสำเร็จ
  useEnergy: (amount: number) => boolean;
  restoreEnergy: () => void;
}

// 2. สร้าง Store
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // ค่าเริ่มต้น (Initial State)
      tokens: 100,      // เริ่มมาแจก 100 เหรียญ
      energy: 50,       // พลังงาน 50/50
      maxEnergy: 50,
      level: 1,
      storageUsed: 0,
      maxStorage: 1024, // ให้ฟรี 1GB (1024MB)

      // ฟังก์ชันเพิ่มเงิน
      addTokens: (amount) => set((state) => ({ tokens: state.tokens + amount })),

      // ฟังก์ชันจ่ายเงิน (มีการเช็คว่าเงินพอไหม)
      spendTokens: (amount) => {
        const currentTokens = get().tokens;
        if (currentTokens >= amount) {
          set({ tokens: currentTokens - amount });
          return true; // จ่ายได้
        }
        return false; // เงินไม่พอ
      },

      // ฟังก์ชันใช้พลังงาน (ลด Energy)
      useEnergy: (amount) => {
        const currentEnergy = get().energy;
        if (currentEnergy >= amount) {
          set({ energy: currentEnergy - amount });
          return true;
        }
        return false;
      },

      // รีพลังงานเต็ม (เอาไว้ใช้ตอนกดปุ่มหรือข้ามวัน)
      restoreEnergy: () => set((state) => ({ energy: state.maxEnergy })),
    }),
    {
      name: 'knowledge-refinery-storage', // ชื่อ key ที่จะเก็บใน LocalStorage
    }
  )
);