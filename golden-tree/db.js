// db.js — ملف الربط مع Firebase (مشترك بين كل الألعاب)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get, set, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyAfsY0dQI9qnIrksRqY4TvOe7YtPhig_Pg",
  authDomain: "chekinroad-afa14.firebaseapp.com",
  databaseURL: "https://chekinroad-afa14-default-rtdb.firebaseio.com",
  projectId: "chekinroad-afa14",
  storageBucket: "chekinroad-afa14.firebasestorage.app",
  messagingSenderId: "871996125208",
  appId: "1:871996125208:web:7f98cf25c469ea0568536d"
};

const db = getDatabase(initializeApp(firebaseConfig));

// جلب بيانات المستخدم (مهلة 8 ثواني). إذا المستخدم جديد بينعمل له سجل.
export async function loadBalance(userId, name){
  const r = ref(db, 'users/' + userId);
  const snap = await Promise.race([
    get(r),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
  ]);
  if (snap.exists()) {
    const d = snap.val();
    return {
      balance: typeof d.balance === 'number' ? d.balance : 0,
      totalSpins: d.totalSpins || 0,
      totalWins: d.totalWins || 0
    };
  }
  const fresh = { name, balance: 0, totalSpins: 0, totalWins: 0, createdAt: Date.now() };
  await set(r, fresh);
  return { balance: 0, totalSpins: 0, totalWins: 0 };
}

// حفظ الرصيد والإحصائيات
export async function saveBalance(userId, data){
  await update(ref(db, 'users/' + userId), { ...data, lastPlayed: Date.now() });
}
