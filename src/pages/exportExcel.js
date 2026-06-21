// Excel-Export mit SheetJS (xlsx)
import * as XLSX from "xlsx";

const fmt = (n) => parseFloat(n) || 0;

const freqLabel = {
  once: "Einmalig", weekly: "Wöchentlich", monthly: "Monatlich",
  bimonthly: "Alle 2 Monate", quarterly: "Alle 3 Monate",
  halfyearly: "Alle 6 Monate", yearly: "Jährlich", biyearly: "Alle 2 Jahre"
};

function applyHeaderStyle(ws, headers) {
  headers.forEach((_, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "01696F" } },
      alignment: { horizontal: "center" }
    };
  });
}

function autoWidth(ws, rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  ws["!cols"] = keys.map(key => ({
    wch: Math.max(key.length, ...rows.map(r => String(r[key] ?? "").length)) + 2
  }));
}

export function exportToExcel(income, expenses, wallets) {
  // ── Sheet 1: Einnahmen ──
  const incomeRows = [...income]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(i => ({
      Datum: i.date || "",
      Name: i.name || "",
      Kategorie: i.category || "",
      "Brutto (€)": fmt(i.amount),
      "Kosten (€)": fmt(i.costs),
      "Netto (€)": fmt(i.netAmount ?? i.amount),
      Häufigkeit: freqLabel[i.frequency] || i.frequency || "",
    }));

  // ── Sheet 2: Ausgaben ──
  const expenseRows = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(e => ({
      Datum: e.date || "",
      Name: e.name || "",
      Kategorie: e.category || "",
      "Betrag (€)": fmt(e.amount),
      Häufigkeit: freqLabel[e.frequency] || e.frequency || "",
    }));

  // ── Sheet 3: Wallets ──
  const walletRows = [...wallets]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .map(w => ({
      Name: w.name || "",
      Typ: w.type || "",
      "Kontostand (€)": fmt(w.amount),
      "Zuletzt aktualisiert": w.updatedAt ? new Date(w.updatedAt).toLocaleDateString("de-DE") : "",
    }));

  // ── Sheet 4: Jahresübersicht ──
  const allYears = [...new Set([
    ...income.map(i => i.date?.split("-")[0]),
    ...expenses.map(e => e.date?.split("-")[0]),
  ])].filter(Boolean).sort();

  const summaryRows = allYears.map(year => {
    const totalIncome = income
      .filter(i => i.date?.startsWith(year))
      .reduce((s, i) => s + fmt(i.netAmount ?? i.amount), 0);
    const totalExpenses = expenses
      .filter(e => e.date?.startsWith(year))
      .reduce((s, e) => s + fmt(e.amount), 0);
    const bilanz = totalIncome - totalExpenses;
    return {
      Jahr: year,
      "Einnahmen (€)": totalIncome,
      "Ausgaben (€)": totalExpenses,
      "Bilanz (€)": bilanz,
      Status: bilanz >= 0 ? "✅ Positiv" : "❌ Negativ",
    };
  });

  // Gesamtzeile
  const gesamtIncome = summaryRows.reduce((s, r) => s + r["Einnahmen (€)"], 0);
  const gesamtExpenses = summaryRows.reduce((s, r) => s + r["Ausgaben (€)"], 0);
  summaryRows.push({
    Jahr: "GESAMT",
    "Einnahmen (€)": gesamtIncome,
    "Ausgaben (€)": gesamtExpenses,
    "Bilanz (€)": gesamtIncome - gesamtExpenses,
    Status: gesamtIncome - gesamtExpenses >= 0 ? "✅ Positiv" : "❌ Negativ",
  });

  // Gesamtvermögen Zeile für Wallets
  walletRows.push({
    Name: "GESAMT",
    Typ: "",
    "Kontostand (€)": wallets.reduce((s, w) => s + fmt(w.amount), 0),
    "Zuletzt aktualisiert": "",
  });

  // ── Workbook zusammenbauen ──
  const wb = XLSX.utils.book_new();

  const wsIncome = XLSX.utils.json_to_sheet(incomeRows);
  autoWidth(wsIncome, incomeRows);
  applyHeaderStyle(wsIncome, Object.keys(incomeRows[0] || {}));
  XLSX.utils.book_append_sheet(wb, wsIncome, "Einnahmen");

  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
  autoWidth(wsExpenses, expenseRows);
  applyHeaderStyle(wsExpenses, Object.keys(expenseRows[0] || {}));
  XLSX.utils.book_append_sheet(wb, wsExpenses, "Ausgaben");

  const wsWallets = XLSX.utils.json_to_sheet(walletRows);
  autoWidth(wsWallets, walletRows);
  applyHeaderStyle(wsWallets, Object.keys(walletRows[0] || {}));
  XLSX.utils.book_append_sheet(wb, wsWallets, "Wallets");

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  autoWidth(wsSummary, summaryRows);
  applyHeaderStyle(wsSummary, Object.keys(summaryRows[0] || {}));
  XLSX.utils.book_append_sheet(wb, wsSummary, "Jahresübersicht");

  const date = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `FinanzPlanner_Export_${date}.xlsx`);
}
