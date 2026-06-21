import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const DataContext = createContext();
export const useData = () => useContext(DataContext);
const safeNum = (v) => parseFloat(v) || 0;

const freqToMonths = {
  weekly: 0,
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  halfyearly: 6,
  yearly: 12,
  biyearly: 24,
  once: null,
};

function generateCarriedEntries(entries, targetYear) {
  const carried = [];
  entries.forEach(entry => {
    if (entry.frequency === "once" || !entry.date) return;
    const entryYear = new Date(entry.date).getFullYear();
    if (targetYear <= entryYear) return;
    const newDate = new Date(entry.date);
    newDate.setFullYear(targetYear);
    carried.push({
      ...entry,
      id: `${entry.id}_carried_${targetYear}`,
      date: newDate.toISOString().split("T")[0],
      isCarried: true
    });
  });
  return carried;
}

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    if (!user) { setIncome([]); setExpenses([]); setWallets([]); return; }
    const uid = user.uid;
    const unsubIncome = onSnapshot(query(collection(db,"users",uid,"income"), orderBy("createdAt","desc")), snap => setIncome(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubExpenses = onSnapshot(query(collection(db,"users",uid,"expenses"), orderBy("createdAt","desc")), snap => setExpenses(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubWallets = onSnapshot(query(collection(db,"users",uid,"wallets"), orderBy("createdAt","desc")), snap => setWallets(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return () => { unsubIncome(); unsubExpenses(); unsubWallets(); };
  }, [user]);

  function getIncomeForYear(year) {
    const direct = income.filter(i => i.date && new Date(i.date).getFullYear() === year);
    const directIds = new Set(direct.map(i => i.id));
    const carried = generateCarriedEntries(income, year).filter(c => {
      const baseId = c.id.split("_carried_")[0];
      return !directIds.has(baseId) && !direct.some(d => d.name === c.name && d.category === c.category);
    });
    return [...direct, ...carried];
  }

  function getExpensesForYear(year) {
    const direct = expenses.filter(e => e.date && new Date(e.date).getFullYear() === year);
    const directNames = new Set(direct.map(e => `${e.name}_${e.category}`));
    const carried = generateCarriedEntries(expenses, year).filter(c => !directNames.has(`${c.name}_${c.category}`));
    return [...direct, ...carried];
  }

  function getTotalIncomeForYear(year) { return getIncomeForYear(year).reduce((s,i) => s + safeNum(i.netAmount ?? i.amount), 0); }
  function getTotalExpensesForYear(year) { return getExpensesForYear(year).reduce((s,e) => s + safeNum(e.amount), 0); }

  const deleteTransaction = async (type, id) => {
    if (!user || id.includes("_carried_")) return;
    await deleteDoc(doc(db,"users",user.uid, type === "income" ? "income" : "expenses", id));
  };

  const deleteIncome = (id) => deleteTransaction("income", id);
  const deleteExpense = (id) => deleteTransaction("expense", id);

  const addIncome = async (data) => { if (!user) return; await addDoc(collection(db,"users",user.uid,"income"), {...data, createdAt: serverTimestamp()}); };
  const addExpense = async (data) => { if (!user) return; await addDoc(collection(db,"users",user.uid,"expenses"), {...data, createdAt: serverTimestamp()}); };
  const addWallet = async (data) => { if (!user) return; await addDoc(collection(db,"users",user.uid,"wallets"), {...data, createdAt: serverTimestamp()}); };
  const updateWallet = async (id, data) => { if (!user) return; await setDoc(doc(db,"users",user.uid,"wallets",id), {...data, updatedAt: serverTimestamp()}, {merge:true}); };
  const deleteWallet = async (id) => { if (!user) return; await deleteDoc(doc(db,"users",user.uid,"wallets",id)); };

  return (
    <DataContext.Provider value={{
      income, expenses, wallets,
      addIncome, addExpense, addWallet,
      updateWallet, deleteWallet,
      deleteTransaction,
      deleteIncome,
      deleteExpense,
      getIncomeForYear,
      getExpensesForYear,
      getTotalIncomeForYear,
      getTotalExpensesForYear
    }}>
      {children}
    </DataContext.Provider>
  );
}
