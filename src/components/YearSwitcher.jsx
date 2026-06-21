import { useState } from "react";
import { useYear } from "../context/YearContext";

export default function YearSwitcher() {
  const { years, selectedYear, setSelectedYear, isAllYears, setIsAllYears, addYear, removeYear } = useYear();
  const [showAdd, setShowAdd] = useState(false);
  const [newYear, setNewYear] = useState("");

  const handleAdd = () => {
    if (newYear) { addYear(newYear); setNewYear(""); }
    setShowAdd(false);
  };

  return (
    <div className="year-switcher-wrap">
      <div className="year-switcher">
        <button className={`year-btn ${isAllYears ? "active" : ""}`} onClick={() => setIsAllYears(true)}>
          Alle
        </button>
        {years.map(y => (
          <div key={y} className="year-btn-group">
            <button
              className={`year-btn ${!isAllYears && selectedYear === y ? "active" : ""}`}
              onClick={() => { setSelectedYear(y); setIsAllYears(false); }}
            >{y}</button>
            {years.length > 1 && (
              <button className="year-remove" onClick={() => removeYear(y)}>×</button>
            )}
          </div>
        ))}
        {showAdd ? (
          <div className="year-add-form">
            <input className="year-add-input" type="number" value={newYear} onChange={e => setNewYear(e.target.value)}
              placeholder="2025" onKeyDown={e => e.key === "Enter" && handleAdd()} autoFocus />
            <button className="year-add-confirm" onClick={handleAdd}>✓</button>
            <button className="year-add-cancel" onClick={() => setShowAdd(false)}>✕</button>
          </div>
        ) : (
          <button className="year-add-btn" onClick={() => setShowAdd(true)}>+ Jahr</button>
        )}
      </div>
    </div>
  );
}
