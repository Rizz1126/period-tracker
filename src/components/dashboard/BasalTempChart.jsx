import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { useCycle } from '../../context/CycleContext';
import { Thermometer, Plus } from 'lucide-react';
import './WidgetCards.css';

export default function BasalTempChart() {
  const { bbtData, todayKey, dispatch } = useCycle();
  const [showInput, setShowInput] = useState(false);
  const [tempValue, setTempValue] = useState('');

  const chartData = bbtData.slice(-14).map((b, i) => ({
    index: i + 1,
    temp: b.temp,
    date: b.date,
  }));

  const avgTemp = chartData.length > 0
    ? (chartData.reduce((sum, d) => sum + d.temp, 0) / chartData.length).toFixed(1)
    : '36.5';

  const handleAddTemp = () => {
    if (!tempValue) return;
    const temp = parseFloat(tempValue);
    if (temp >= 35 && temp <= 38) {
      dispatch({
        type: 'ADD_BBT',
        payload: { date: todayKey, temp },
      });
      setTempValue('');
      setShowInput(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="widget-tooltip">
          <p className="widget-tooltip-title">{data?.date}</p>
          <p>{data?.temp}°C</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="widget-card card animate-fade-in-up stagger-4" id="bbt-chart">
      <div className="widget-header">
        <div className="widget-icon" style={{ background: 'linear-gradient(135deg, #EF5350, #E53935)' }}>
          <Thermometer size={18} color="white" />
        </div>
        <div>
          <h3 className="widget-title">Basal Body Temp</h3>
          <p className="widget-subtitle">Avg: {avgTemp}°C</p>
        </div>
        <button
          className="widget-add-btn"
          onClick={() => setShowInput(!showInput)}
          title="Add today's temperature"
        >
          <Plus size={18} />
        </button>
      </div>

      {showInput && (
        <div className="bbt-input-row">
          <input
            type="number"
            step="0.1"
            min="35"
            max="38"
            placeholder="36.5"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="bbt-input"
            autoFocus
          />
          <span className="bbt-unit">°C</span>
          <button className="btn btn-primary btn-sm" onClick={handleAddTemp}>Save</button>
        </div>
      )}

      <div className="widget-chart">
        <ResponsiveContainer width="100%" height={100}>
          <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <XAxis dataKey="index" tick={false} axisLine={false} />
            <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={parseFloat(avgTemp)} stroke="var(--pink-300)" strokeDasharray="3 3" />
            <Scatter data={chartData} fill="var(--pink-500)" r={4} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
