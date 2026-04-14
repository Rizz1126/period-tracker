import { useState, useMemo } from 'react';
import { useCycle } from '../context/CycleContext';
import { getCurrentPhase, PHASE_INFO, toDateString, formatDate, getFertileWindow } from '../utils/cycleCalculations';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarPage.css';

export default function CalendarPage() {
  const { cycles, dailyLogs, predictedLength, settings, daysUntilPeriod } = useCycle();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate date ranges for highlights
  const highlightRanges = useMemo(() => {
    const ranges = {
      period: [],       // actual period dates (red)
      ovulation: [],    // ovulation/fertile window (green)
      nextPeriod: [],   // predicted next period (purple dashed)
    };

    const lastCycle = cycles[cycles.length - 1];
    if (!lastCycle) return ranges;

    const startDate = new Date(lastCycle.startDate);
    const periodLength = settings.periodLength || 5;
    const fertileWindow = getFertileWindow(predictedLength);

    // Actual period dates
    for (let i = 0; i < periodLength; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      ranges.period.push(toDateString(d));
    }

    // Ovulation/fertile window
    for (let i = fertileWindow.start - 1; i < fertileWindow.end; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      ranges.ovulation.push(toDateString(d));
    }

    // Predicted next period
    const nextPeriodStart = new Date(startDate);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + predictedLength);
    for (let i = 0; i < periodLength; i++) {
      const d = new Date(nextPeriodStart);
      d.setDate(d.getDate() + i);
      ranges.nextPeriod.push(toDateString(d));
    }

    return ranges;
  }, [cycles, predictedLength, settings.periodLength]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toDateString(new Date(year, month, day));
      const log = dailyLogs[dateStr];

      let phaseForDay = null;
      for (let i = cycles.length - 1; i >= 0; i--) {
        const cycleStart = new Date(cycles[i].startDate);
        const thisDate = new Date(year, month, day);
        if (thisDate >= cycleStart) {
          const dayInCycle = Math.floor((thisDate - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
          phaseForDay = getCurrentPhase(dayInCycle, predictedLength, settings.periodLength);
          break;
        }
      }

      const isToday = dateStr === toDateString(new Date());
      const isPeriod = highlightRanges.period.includes(dateStr);
      const isOvulation = highlightRanges.ovulation.includes(dateStr);
      const isNextPeriod = highlightRanges.nextPeriod.includes(dateStr);

      // Determine position in range for styling rounded edges
      const periodPos = isPeriod ? getRangePos(dateStr, highlightRanges.period) : null;
      const ovulationPos = isOvulation ? getRangePos(dateStr, highlightRanges.ovulation) : null;
      const nextPeriodPos = isNextPeriod ? getRangePos(dateStr, highlightRanges.nextPeriod) : null;

      days.push({
        day,
        dateStr,
        log,
        phase: phaseForDay,
        isToday,
        isPeriod,
        isOvulation,
        isNextPeriod,
        periodPos,
        ovulationPos,
        nextPeriodPos,
      });
    }

    return days;
  }, [year, month, cycles, dailyLogs, predictedLength, settings.periodLength, highlightRanges]);

  function getRangePos(dateStr, range) {
    const idx = range.indexOf(dateStr);
    if (range.length === 1) return 'only';
    if (idx === 0) return 'start';
    if (idx === range.length - 1) return 'end';
    return 'mid';
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const nextPeriodDate = new Date();
  nextPeriodDate.setDate(nextPeriodDate.getDate() + daysUntilPeriod);

  const fertileWindow = getFertileWindow(predictedLength);
  const lastCycle = cycles[cycles.length - 1];
  const ovulationStart = lastCycle ? (() => {
    const d = new Date(lastCycle.startDate);
    d.setDate(d.getDate() + fertileWindow.start - 1);
    return d;
  })() : null;
  const ovulationEnd = lastCycle ? (() => {
    const d = new Date(lastCycle.startDate);
    d.setDate(d.getDate() + fertileWindow.end - 1);
    return d;
  })() : null;

  return (
    <div className="calendar-page" id="calendar-page">
      <div className="page-header">
        <h1 className="text-h1">Calendar</h1>
        <p className="text-caption">Track your cycle day by day with history and predictions.</p>
      </div>

      <div className="calendar-info-cards">
        <div className="calendar-info-card period-info">
          <span className="info-dot period-dot-lg" />
          <div>
            <p className="info-label">Next expected period</p>
            <p className="info-value">{formatDate(nextPeriodDate)}</p>
            <p className="info-sub">{daysUntilPeriod} days away</p>
          </div>
        </div>
        {ovulationStart && (
          <div className="calendar-info-card ovulation-info">
            <span className="info-dot ovulation-dot-lg" />
            <div>
              <p className="info-label">Ovulation window</p>
              <p className="info-value">{formatDate(ovulationStart)} – {formatDate(ovulationEnd)}</p>
              <p className="info-sub">Day {fertileWindow.start}–{fertileWindow.end} of cycle</p>
            </div>
          </div>
        )}
      </div>

      <div className="calendar-container card-flat">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="calendar-month-title">{monthName}</h2>
          <button className="calendar-nav-btn" onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-weekdays">
          {weekDays.map(d => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((item, i) => {
            if (!item) return <div key={i} className="calendar-cell empty" />;

            let highlightClass = '';
            let posClass = '';
            if (item.isPeriod) {
              highlightClass = 'highlight-period';
              posClass = `range-${item.periodPos}`;
            } else if (item.isNextPeriod) {
              highlightClass = 'highlight-next-period';
              posClass = `range-${item.nextPeriodPos}`;
            } else if (item.isOvulation) {
              highlightClass = 'highlight-ovulation';
              posClass = `range-${item.ovulationPos}`;
            }

            return (
              <div
                key={i}
                className={`calendar-cell has-date ${item.isToday ? 'today' : ''} ${highlightClass} ${posClass}`}
              >
                <span className="calendar-day-number">{item.day}</span>
                {item.log && (
                  <div className="calendar-log-indicators">
                    {item.log.flow && <span className="log-dot flow">💧</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="calendar-legend-section">
          <h4 className="legend-title">Legend</h4>
          <div className="calendar-legend-grid">
            <div className="legend-row">
              <span className="legend-swatch period-swatch" />
              <div>
                <span className="legend-name">Period (Actual)</span>
                <span className="legend-desc">Days of menstrual bleeding</span>
              </div>
            </div>
            <div className="legend-row">
              <span className="legend-swatch next-period-swatch" />
              <div>
                <span className="legend-name">Predicted Next Period</span>
                <span className="legend-desc">Estimated start of your next cycle</span>
              </div>
            </div>
            <div className="legend-row">
              <span className="legend-swatch ovulation-swatch" />
              <div>
                <span className="legend-name">Fertile / Ovulation Window</span>
                <span className="legend-desc">Higher chance of pregnancy during this window</span>
              </div>
            </div>
            <div className="legend-row">
              <span className="legend-swatch today-swatch" />
              <div>
                <span className="legend-name">Today</span>
                <span className="legend-desc">Current date</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 'var(--space-2xl)' }} />
    </div>
  );
}
