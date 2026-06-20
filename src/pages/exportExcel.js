// Excel-Export mit SheetJS (xlsx)
// npm install xlsx  (falls noch nicht installiert)

export async function exportToExcel(income, expenses, wallets) {
  const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");

  const fmt = (n) => parseFloat(n) || 0;

  const freqLabel = {
    once: "Einmalig", weekly: "Wöchentlich", monthly: "Monatlich",
    bimonthly: "Alle 2 Monate", quarterly: "Alle 3 Monate",
    halfyearly: "Alle 6 Monate", yearly: "Jährlich", biyearly: "Alle 2 Jahre"
  };

  // ── Tabelle 1: Einnahmen ──
  const incomeRows = income.map(i => ({
    Datum: i.date || "",
    Name: i.name || "",
    Kategorie: i.category || "",
    Betrag: fmt(i.amount),
    "Netto-Betrag": fmt(i.netAmount ?? i.amount),
    Kosten: fmt(i.costs),
    Häufigkeit: freqLabel[i.frequency] || i.frequency || "",
    Wiederholungen: i.times || 1,
  }));

  // ── Tabelle 2: Ausgaben ──
  const expenseRows = expenses.map(e => ({
    Datum: e.date || "",
    Name: e.name || "",
    Kategorie: e.category || "",
    Betrag: fmt(e.amount),
    Häufigkeit: freqLabel[e.frequency] || e.frequency || "",
    Wiederholungen: e.times || 1,
  }));

  // ── Tabelle 3: Wallets ──
  const walletRows = wallets.map(w => ({
    Name: w.name || "",
    Typ: w.type || "",
    Kontostand: fmt(w.amount),
    Icon: w.icon || "",
  }));

  // ── Tabelle 4: Übersicht nach Jahr ──
  const allYears = [...new Set([
    ...income.map(i => i.date?.split("-")[0]),
    ...expenses.map(e => e.date?.split("-")[0]),
  ])].filter(Boolean).sort();

  const summaryRows = allYears.map(year => {
    const totalIncome   = income.filter(i => i.date?.startsWith(year)).reduce((s,i) => s + fmt(i.netAmount ?? i.amount), 0);
    const totalExpenses = expenses.filter(e => e.date?.startsWith(year)).reduce((s,e) => s + fmt(e.amount), 0);
    return {
      Jahr: year,
      "Einnahmen (€)": totalIncome,
      "Ausgaben (€)": totalExpenses,
      "Bilanz (€)": totalIncome - totalExpenses,
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeRows),   "Einnahmen");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows),  "Ausgaben");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(walletRows),   "Wallets");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows),  "Jahresübersicht");

  const date = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `FinanzPlanner_Export_${date}.xlsx`);
}
