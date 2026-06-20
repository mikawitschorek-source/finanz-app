import { useState } from "react";
import { useYear } from "../context/YearContext";

export default function YearSwitcher() {
  const { selectedYear, setSelectedYear, isAllYears, setIsAllYears, years, addYear, removeYear } = useYear();
  const [showAdd, setShowAdd] = useState(false);
  const [inputYear, setInputYear] = useState("");

  const handleAdd = () => {
    const y = parseInt(inputYear);
    if (!y || y < 2000 || y > 2100) return;
    addYear(y);
    setInputYear("");
    setShowAdd(false);
  };

  return (
    <div className="year-switcher-wrap">
      <div className="year-switcher">
        <button
          className={`year-btn ${isAllYears ? "active" : ""}`}
          onClick={() => setIsAllYears(true)}
        >
          Gesamt
        </button>
        {years.map(y => (
          <div key={y} className="year-btn-group">
            <button
              className={`year-btn ${!isAllYears && selectedYear === y ? "active" : ""}`}
              onClick={() => { setSelectedYear(y); setIsAllYears(false); }}
            >
              {y}
            </button>
            {years.length > 1 && (
              <button
                className="year-remove"
                onClick={(e) => { e.stopPropagation(); removeYear(y); }}
                title="Jahr entfernen"
              >×</button>
            )}
          </div>
        ))}

        {showAdd ? (
          <div className="year-add-form">
            <input
              type="number"
              value={inputYear}
              onChange={e => setInputYear(e.target.value)}
              placeholder="z.B. 2027"
              className="year-add-input"
              onKeyDown={e => { if(e.key==="Enter") handleAdd(); if(e.key==="Escape") setShowAdd(false); }}
              autoFocus
              min="2000" max="2100"
            />
            <button className="year-add-confirm" onClick={handleAdd}>✓</button>
            <button className="year-add-cancel" onClick={() => setShowAdd(false)}>✕</button>
          </div>
        ) : (
          <button className="year-add-btn" onClick={() => setShowAdd(true)} title="Jahr hinzufügen">
            + Jahr
          </button>
        )}
      </div>
    </div>
  );
}
