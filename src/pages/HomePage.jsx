import { useState } from 'react';
import { useCycle } from '../context/CycleContext';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import StartPeriodForm from '../components/dashboard/StartPeriodForm';
import './HomePage.css';

export default function HomePage() {
  const { activeCycle } = useCycle();
  const [showStartForm, setShowStartForm] = useState(false);

  return (
    <div className="home-page" id="dashboard-home">
      <DashboardSummary />

      {!activeCycle && (
        <section className="start-period-card card-flat animate-fade-in-up" id="start-period-card">
          <div className="start-period-content">
            <span className="start-period-icon">🌸</span>
            <div>
              <h2 className="text-h2">Ready to track?</h2>
              <p className="text-body">Log the start of your period to unlock daily check-ins and pattern insights.</p>
            </div>
          </div>
          <button className="btn btn-primary start-period-btn" type="button" onClick={() => setShowStartForm(true)}>
            Start Period
          </button>
          {showStartForm && <StartPeriodForm onClose={() => setShowStartForm(false)} />}
        </section>
      )}

      <div style={{ height: 'var(--space-xl)' }} />
    </div>
  );
}
