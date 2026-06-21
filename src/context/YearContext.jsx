import { createContext, useContext, useState } from "react";

const YearContext = createContext();
export const useYear = () => useContext(YearContext);

export function YearProvider({ children }) {
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState([currentYear]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isAllYears, setIsAllYears] = useState(false);

  const addYear = (y) => {
    const yr = parseInt(y);
    if (!yr || years.includes(yr)) return;
    setYears(prev => [...prev, yr].sort((a,b) => a-b));
  };
  const removeYear = (y) => {
    if (years.length <= 1) return;
    const next = years.filter(yr => yr !== y);
    setYears(next);
    if (selectedYear === y) setSelectedYear(next[next.length-1]);
  };

  return (
    <YearContext.Provider value={{ years, selectedYear, setSelectedYear, isAllYears, setIsAllYears, addYear, removeYear }}>
      {children}
    </YearContext.Provider>
  );
}
