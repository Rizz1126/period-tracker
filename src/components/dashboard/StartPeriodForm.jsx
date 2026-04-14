import { useState } from 'react';
import { useCycle } from '../../context/CycleContext';
import { toDateString } from '../../utils/cycleCalculations';
import DatePickerPopup from './DatePickerPopup';

export default function StartPeriodForm({ onClose }) {
  const { dispatch } = useCycle();
  const today = toDateString(new Date());
  const [startDate, setStartDate] = useState(today);
  const [crampsDate, setCrampsDate] = useState(today);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch({
      type: 'START_PERIOD',
      payload: {
        startDate,
        earlyCrampsDate: crampsDate,
      },
    });
    onClose?.();
  };

  return (
    <div className="start-period-form card-flat animate-fade-in-up" id="start-period-form">
      <h2 className="text-h2">When did it start?</h2>
      <p className="text-body">Tell us when your period began and when the cramps started. This helps us see your patterns better.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <DatePickerPopup
          label="Period Start Date"
          id="start-date"
          value={startDate}
          onChange={setStartDate}
        />

        <DatePickerPopup
          label="When Did the Cramps Start?"
          id="cramps-date"
          value={crampsDate}
          onChange={setCrampsDate}
        />

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Let's Go!</button>
        </div>
      </form>
    </div>
  );
}
