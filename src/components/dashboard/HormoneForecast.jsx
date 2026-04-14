import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useCycle } from '../../context/CycleContext';
import { getHormoneLevels } from '../../utils/cycleCalculations';
import { TrendingUp } from 'lucide-react';
import './WidgetCards.css';

export default function HormoneForecast() {
  const { cycleDay, predictedLength, hormones } = useCycle();

  const chartData = useMemo(() => {
    const data = [];
    for (let day = 1; day <= predictedLength; day++) {
      const levels = getHormoneLevels(day, predictedLength);
      data.push({
        day,
        estrogen: levels.estrogen,
        progesterone: levels.progesterone,
        testosterone: levels.testosterone,
        isToday: day === cycleDay,
      });
    }
    return data;
  }, [predictedLength, cycleDay]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="widget-tooltip">
          <p className="widget-tooltip-title">Day {payload[0]?.payload?.day}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: {p.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="widget-card card animate-fade-in-up stagger-3" id="hormone-forecast">
      <div className="widget-header">
        <div className="widget-icon" style={{ background: 'linear-gradient(135deg, #F06292, #EC407A)' }}>
          <TrendingUp size={18} color="white" />
        </div>
        <div>
          <h3 className="widget-title">Hormone Forecast</h3>
          <p className="widget-subtitle">Estimated levels today</p>
        </div>
      </div>

      <div className="hormone-levels">
        <div className="hormone-pill">
          <span className="hormone-dot" style={{ background: '#F06292' }}></span>
          <span>Estrogen</span>
          <strong>{hormones.estrogen}%</strong>
        </div>
        <div className="hormone-pill">
          <span className="hormone-dot" style={{ background: '#AB47BC' }}></span>
          <span>Progesterone</span>
          <strong>{hormones.progesterone}%</strong>
        </div>
        <div className="hormone-pill">
          <span className="hormone-dot" style={{ background: '#FFB74D' }}></span>
          <span>Testosterone</span>
          <strong>{hormones.testosterone}%</strong>
        </div>
      </div>

      <div className="widget-chart">
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData}>
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="estrogen" stroke="#F06292" strokeWidth={2} dot={false} name="Estrogen" />
            <Line type="monotone" dataKey="progesterone" stroke="#AB47BC" strokeWidth={2} dot={false} name="Progesterone" />
            <Line type="monotone" dataKey="testosterone" stroke="#FFB74D" strokeWidth={1.5} dot={false} name="Testosterone" />
          </LineChart>
        </ResponsiveContainer>
        {/* Today marker */}
        <div
          className="chart-today-marker"
          style={{ left: `${(cycleDay / predictedLength) * 100}%` }}
        >
          <div className="today-marker-line"></div>
          <span className="today-marker-label">Today</span>
        </div>
      </div>
    </div>
  );
}
