import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, getDocs, limit, Timestamp } from 'firebase/firestore';

export interface AnalysisHistory {
  id?: string;
  fileName: string;
  fileType: string;
  summary: string;
  tokensEarned: number;
  createdAt: any; // Firestore Timestamp
}

const COLLECTION_NAME = 'history';

// 1. บันทึกงานใหม่
export const saveHistory = async (data: Omit<AnalysisHistory, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: Timestamp.now()
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// 2. ดึงประวัติเก่าๆ (เอาล่าสุด 10 อัน)
export const getRecentHistory = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalysisHistory[];
  } catch (e) {
    console.error("Error getting history: ", e);
    return [];
  }
};