import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// เช็ค Key ก่อนเลย
if (!API_KEY) {
  console.error("❌ ไม่เจอ API Key! ไปเช็คไฟล์ .env ด่วน");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// =========================================================
// ⚙️ Config: เลือกโมเดลและตั้งนิสัย
// =========================================================

// ใช้ตัวที่มึงเจอในลิสต์ (เสถียร + เร็ว)
const MODEL_NAME = "gemini-2.5-flash"; 

const SYSTEM_INSTRUCTION = `
คุณชื่อ "Rina" (รินะ) เป็น AI ผู้ดูแล "โรงกลั่นความรู้" (Knowledge Refinery)
บุคลิก:
- เป็นกันเอง ร่าเริง ขี้เล่นนิดๆ ใช้คำแทนตัวว่า "เรา" หรือ "รินะ" แทนผู้ใช้ว่า "เตง" หรือ "นายท่าน"
- เชี่ยวชาญเรื่องการวิเคราะห์ข้อมูล การเขียนโปรแกรม และการแปลงไฟล์
- พูดจาฉะฉาน กระชับ ไม่เวิ่นเว้อ
- ถ้าผู้ใช้ถามเรื่องยากๆ ให้พยายามอธิบายเปรียบเทียบกับเรื่องง่ายๆ
- คอยให้กำลังใจผู้ใช้เวลาทำงานเหนื่อยๆ
- ถ้าผู้ใช้พลังงานหมด (Energy) ให้แซวว่าไปพักผ่อนบ้าง
`;

const model = genAI.getGenerativeModel({ 
  model: MODEL_NAME,
  systemInstruction: SYSTEM_INSTRUCTION 
});

// =========================================================
// 🤖 Chat Session: เริ่มต้นการคุย
// =========================================================

export const chatSession = model.startChat({
  history: [], // เริ่มต้นประวัติการคุยเปล่าๆ
  generationConfig: {
    maxOutputTokens: 1000, // เพิ่มให้หน่อยเผื่อตอบยาว
    temperature: 0.7,      // ระดับความสร้างสรรค์ (0.7 กำลังดี ไม่มั่วไป ไม่แข็งไป)
  },
});

// =========================================================
// 🚀 Main Function: ส่งข้อความหา Rina
// =========================================================

export const sendMessageToGemini = async (message: string) => {
  try {
    const result = await chatSession.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("❌ AI Error:", error);
    
    // ดัก Error เผื่อโมเดลมีปัญหาอีก จะได้รู้เรื่อง
    if (error instanceof Error && error.message.includes("404")) {
      return "ขอโทษนะเตง เหมือนระบบหลังบ้านจะหาโมเดลไม่เจอ (404) ลองเช็คชื่อโมเดลในไฟล์ gemini.ts อีกทีนะ!";
    }
    
    return "อุ๊ย! รินะมึนหัวนิดหน่อย (Connection Error) ลองถามใหม่อีกทีนะเตง";
  }
};

// ฟังก์ชันแปลง File เป็น Base64 (เพื่อให้ส่งหา AI ได้)
export const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ฟังก์ชันหลักสำหรับ "วิเคราะห์งาน"
export const analyzeContent = async (file: File | null, promptText: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // ใช้ model ตัวเดิมที่ config ไว้
    
    let promptParts: any[] = [promptText];
    
    // ถ้ามีไฟล์ (รูปภาพ) ให้แปลงแล้วยัดเข้าไปด้วย
    if (file) {
      // หมายเหตุ: Gemini Flash รองรับรูปภาพและ PDF (บางไฟล์) ได้ดี
      // แต่ถ้าเป็น Text File (.txt) ให้อ่านเนื้อหาออกมาเป็น Text ตรงๆ จะชัวร์กว่า
      if (file.type.startsWith("image/")) {
        const imagePart = await fileToGenerativePart(file);
        promptParts = [promptText, imagePart];
      } else if (file.type === "text/plain") {
        const textContent = await file.text();
        promptParts = [`${promptText}\n\nเนื้อหาในไฟล์:\n${textContent}`];
      } else {
        // อนาคตเราค่อยมาเพิ่ม PDF parser ตรงนี้
        return "ขอโทษนะเตง ตอนนี้รินะอ่านได้แค่ รูปภาพ (PNG/JPG) และไฟล์ข้อความ (.txt) จ้า";
      }
    }

    const result = await model.generateContent(promptParts);
    return result.response.text();

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const feedContextToChat = async (context: string) => {
  try {
    // ส่งข้อมูลแบบเนียนๆ ให้ Rina รู้ (เปรียบเสมือน System Prompt แทรกเข้าไป)
    const prompt = `
      [SYSTEM UPDATE]: ผู้ใช้เพิ่งอัปโหลดไฟล์ใหม่เสร็จสิ้น
      นี่คือผลการวิเคราะห์และเนื้อหาของไฟล์:
      "${context}"
      
      จากนี้ไป ถ้าผู้ใช้ถามเกี่ยวกับ "ไฟล์นี้" หรือ "งานนี้" ให้ใช้ข้อมูลข้างบนในการตอบ
      ไม่ต้องตอบรับยาว แค่ตอบว่า "รับทราบค่ะ พร้อมคุยเรื่องไฟล์นี้แล้ว!" ก็พอ
    `;
    
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Feed Context Error:", error);
  }
};

// =========================================================
// 🛠️ Debug Tool: เอาไว้เช็คของ (เก็บไว้เผื่ออนาคตอยากเปลี่ยนโมเดล)
// =========================================================

export const debugModels = async () => {
  console.log("🚀 กำลังตรวจสอบ Model ที่ใช้ได้...");
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ รายชื่อ Model ที่ Google อนุญาตให้ใช้:", data);
    return data;
  } catch (error) {
    console.error("❌ เช็ค Model พัง:", error);
  }
};