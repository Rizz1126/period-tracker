import * as XLSX from 'xlsx';

export function exportToExcel(cycles, dailyLogs, settings) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Cycles
  const cycleRows = cycles.map((c, i) => ({
    'Cycle #': i + 1,
    'Start Date': c.startDate || '',
    'End Date': c.endDate || 'Ongoing',
    'Length (days)': c.length || '',
    'Early Cramps Date': c.earlyCrampsDate || '',
  }));
  const wsCycles = XLSX.utils.json_to_sheet(cycleRows.length ? cycleRows : [{ 'Cycle #': '', 'Start Date': '', 'End Date': '', 'Length (days)': '', 'Early Cramps Date': '' }]);
  XLSX.utils.book_append_sheet(wb, wsCycles, 'Cycles');

  // Sheet 2: Daily Logs
  const logRows = Object.entries(dailyLogs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, log]) => ({
      'Date': date,
      'Flow': log.flow || '',
      'Pain': log.pain || '',
      'Mood': Array.isArray(log.mood) ? log.mood.join(', ') : (log.mood || ''),
      'Sleep (hours)': log.sleep || '',
      'Water (cups)': log.water || '',
      'Symptoms': Array.isArray(log.symptoms) ? log.symptoms.join(', ') : '',
      'Energy Level': log.energyLevel || '',
      'Stress Level': log.stressLevel || '',
      'Emotional Sensitivity': log.emotionalSensitivity || '',
      'Affection Need': log.affectionNeed || '',
      'Conflict Sensitivity': log.conflictSensitivity || '',
      'BBT (°C)': log.bbt || '',
      'Medications': Array.isArray(log.medications) ? log.medications.join(', ') : '',
    }));
  const wsLogs = XLSX.utils.json_to_sheet(logRows.length ? logRows : [{ Date: '' }]);
  XLSX.utils.book_append_sheet(wb, wsLogs, 'Daily Logs');

  // Sheet 3: Summary
  const completedCycles = cycles.filter(c => c.endDate);
  const lengths = completedCycles.map(c => c.length).filter(Boolean);
  const avgLength = lengths.length > 0
    ? (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1)
    : 'N/A';
  const shortest = lengths.length > 0 ? Math.min(...lengths) : 'N/A';
  const longest = lengths.length > 0 ? Math.max(...lengths) : 'N/A';

  const summaryRows = [
    { Metric: 'Total Cycles Tracked', Value: cycles.length },
    { Metric: 'Completed Cycles', Value: completedCycles.length },
    { Metric: 'Average Cycle Length', Value: avgLength },
    { Metric: 'Shortest Cycle', Value: shortest },
    { Metric: 'Longest Cycle', Value: longest },
    { Metric: 'Period Length Setting', Value: `${settings.periodLength} days` },
    { Metric: 'Total Days Logged', Value: Object.keys(dailyLogs).length },
    { Metric: 'Export Date', Value: new Date().toISOString().split('T')[0] },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Auto-size columns for readability
  [wsCycles, wsLogs, wsSummary].forEach(ws => {
    if (!ws['!ref']) return;
    const range = XLSX.utils.decode_range(ws['!ref']);
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      let maxLen = 10;
      for (let R = range.s.r; R <= range.e.r; R++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v) {
          const len = String(cell.v).length;
          if (len > maxLen) maxLen = len;
        }
      }
      colWidths.push({ wch: Math.min(maxLen + 2, 40) });
    }
    ws['!cols'] = colWidths;
  });

  // Download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bloom-tracker-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
