import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { mockCycleHistory, mockDailyLogs, mockBBTData } from '../data/mockCycleData';
import {
  predictCycleLength,
  getCycleDay,
  getCurrentPhase,
  daysUntilNextPeriod,
  getHormoneLevels,
  getFertilityLevel,
  getPredictiveText,
  getFertileWindow,
} from '../utils/cycleCalculations';
import { calculateHealthScore } from '../utils/healthScore';
import { toDateString } from '../utils/cycleCalculations';

const CycleContext = createContext();

const initialState = {
  cycles: [],
  dailyLogs: {},
  bbtData: [],
  settings: {
    periodLength: 5,
  },
  userLoggedIn: false,
  userName: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'LOGIN':
      return { ...state, userLoggedIn: true, userName: action.payload.name };

    case 'LOGOUT':
      return { ...state, userLoggedIn: false, userName: '' };

    case 'START_PERIOD':
      return {
        ...state,
        cycles: [
          ...state.cycles,
          {
            startDate: action.payload.startDate,
            earlyCrampsDate: action.payload.earlyCrampsDate,
            endDate: null,
            length: null,
          },
        ],
      };

    case 'CLOSE_PERIOD': {
      const updatedCycles = [...state.cycles];
      const lastIndex = updatedCycles.length - 1;
      if (lastIndex < 0) return state;
      const cycle = updatedCycles[lastIndex];
      const start = new Date(cycle.startDate);
      const end = new Date(action.payload.endDate);
      const diff = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);
      updatedCycles[lastIndex] = {
        ...cycle,
        endDate: action.payload.endDate,
        length: diff,
      };
      return { ...state, cycles: updatedCycles };
    }

    case 'UPDATE_DAILY_LOG': {
      const newLogs = {
        ...state.dailyLogs,
        [action.payload.date]: {
          ...state.dailyLogs[action.payload.date],
          ...action.payload.data,
        },
      };
      return { ...state, dailyLogs: newLogs };
    }

    case 'ADD_BBT': {
      const existing = state.bbtData.findIndex(b => b.date === action.payload.date);
      if (existing >= 0) {
        const newBBT = [...state.bbtData];
        newBBT[existing] = action.payload;
        return { ...state, bbtData: newBBT };
      }
      return { ...state, bbtData: [...state.bbtData, action.payload] };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'CLEAR_ALL':
      return initialState;

    default:
      return state;
  }
}

export function CycleProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCycles = loadFromStorage(STORAGE_KEYS.CYCLE_DATA);
    const savedLogs = loadFromStorage(STORAGE_KEYS.DAILY_LOGS);
    const savedBBT = loadFromStorage(STORAGE_KEYS.BBT_DATA);
    const savedSettings = loadFromStorage(STORAGE_KEYS.SETTINGS);
    const savedUser = loadFromStorage(STORAGE_KEYS.USER_STATUS);

    dispatch({
      type: 'LOAD_DATA',
      payload: {
        cycles: savedCycles || mockCycleHistory,
        dailyLogs: savedLogs || mockDailyLogs,
        bbtData: savedBBT || mockBBTData,
        settings: savedSettings || initialState.settings,
        userLoggedIn: savedUser?.userLoggedIn || false,
        userName: savedUser?.userName || '',
      },
    });
    setHydrated(true);
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(STORAGE_KEYS.CYCLE_DATA, state.cycles);
    saveToStorage(STORAGE_KEYS.DAILY_LOGS, state.dailyLogs);
    saveToStorage(STORAGE_KEYS.BBT_DATA, state.bbtData);
    saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
    saveToStorage(STORAGE_KEYS.USER_STATUS, {
      userLoggedIn: state.userLoggedIn,
      userName: state.userName,
    });
  }, [state]);

  const completedCycles = state.cycles.filter(cycle => cycle.endDate);
  const lastCycle = state.cycles[state.cycles.length - 1];
  const predictedLength = predictCycleLength(completedCycles.map(c => c.length));
  const cycleDay = lastCycle ? getCycleDay(lastCycle.startDate) : 1;
  const currentPhase = getCurrentPhase(cycleDay, predictedLength, state.settings.periodLength);
  const daysUntilPeriod = daysUntilNextPeriod(cycleDay, predictedLength);
  const hormones = getHormoneLevels(cycleDay, predictedLength);
  const fertility = getFertilityLevel(cycleDay, predictedLength);
  const todayKey = toDateString(new Date());
  const todayLog = state.dailyLogs[todayKey] || {};
  const healthScore = calculateHealthScore(todayLog, currentPhase);
  const predictiveText = getPredictiveText(cycleDay, predictedLength, state.settings.periodLength);
  const fertileWindow = getFertileWindow(predictedLength);
  const activeCycle = Boolean(lastCycle && !lastCycle.endDate);

  const value = {
    ...state,
    hydrated,
    dispatch,
    // Derived
    completedCycles,
    lastCycle,
    predictedLength,
    cycleDay,
    currentPhase,
    daysUntilPeriod,
    hormones,
    fertility,
    todayLog,
    todayKey,
    healthScore,
    predictiveText,
    cycleLengths: completedCycles.map(c => c.length),
    fertileWindow,
    activeCycle,
  };

  return (
    <CycleContext.Provider value={value}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const context = useContext(CycleContext);
  if (!context) throw new Error('useCycle must be used within CycleProvider');
  return context;
}
