import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const YearContext = createContext();
export const useYear = () => useContext(YearContext);

export function YearProvider({ children }) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState([currentYear]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isAllYears, setIsAllYears] = useState(false);

  useEffect(() => {
    if (!user) { setYears([currentYear]); return; }
    const ref = doc(db, "users", user.uid, "settings", "years");
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = snap.data();
        const y = (data.years || [currentYear]).sort((a,b)=>a-b);
        setYears(y);
        if (!y.includes(selectedYear)) setSelectedYear(y[y.length-1]);
      } else {
        saveYears([currentYear]);
      }
    });
    return unsub;
  }, [user]);

  const saveYears = async (newYears) => {
    if (!user) return;
    const sorted = [...new Set(newYears)].sort((a,b)=>a-b);
    setYears(sorted);
    await setDoc(doc(db, "users", user.uid, "settings", "years"), { years: sorted }, { merge: true });
  };

  const addYear = async (year) => {
    if (years.includes(year)) { setSelectedYear(year); setIsAllYears(false); return; }
    await saveYears([...years, year]);
    setSelectedYear(year);
    setIsAllYears(false);
  };

  const removeYear = async (year) => {
    if (years.length <= 1) return;
    const newYears = years.filter(y => y !== year);
    await saveYears(newYears);
    if (selectedYear === year) setSelectedYear(newYears[newYears.length-1]);
  };

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, isAllYears, setIsAllYears, years, currentYear, addYear, removeYear }}>
      {children}
    </YearContext.Provider>
  );
}
