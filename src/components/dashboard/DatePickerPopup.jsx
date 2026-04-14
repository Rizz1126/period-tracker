import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DatePickerPopup({ value, onChange, label, id }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const selected = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const todayStr = toStr(today.getFullYear(), today.getMonth(), today.getDate());

  const handlePick = (day) => {
    const dateStr = toStr(viewYear, viewMonth, day);
    onChange(dateStr);
    setOpen(false);
  };

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Select date';

  return (
    <div className="datepicker-wrapper" ref={wrapperRef}>
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <button
        type="button"
        className="datepicker-trigger"
        id={id}
        onClick={() => {
          if (!open) {
            setViewYear(selected.getFullYear());
            setViewMonth(selected.getMonth());
          }
          setOpen(!open);
        }}
      >
        <Calendar size={16} />
        <span>{displayValue}</span>
      </button>

      {open && (
        <div className="datepicker-dropdown animate-fade-in">
          <div className="datepicker-nav">
            <button type="button" className="datepicker-nav-btn" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span className="datepicker-month-label">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" className="datepicker-nav-btn" onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="datepicker-weekdays">
            {WEEKDAYS.map(w => <span key={w} className="datepicker-weekday">{w}</span>)}
          </div>

          <div className="datepicker-grid">
            {cells.map((day, i) => {
              if (!day) return <span key={`e${i}`} className="datepicker-cell empty" />;
              const dateStr = toStr(viewYear, viewMonth, day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === value;
              return (
                <button
                  key={day}
                  type="button"
                  className={`datepicker-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePick(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
