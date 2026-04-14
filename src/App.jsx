import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CycleProvider, useCycle } from './context/CycleContext';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';

function PrivateRoute({ children }) {
  const { userLoggedIn, hydrated } = useCycle();
  if (!hydrated) return null;
  return userLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <CycleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppShell />}>
              <Route path="/" element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              } />
              <Route path="/analysis" element={
                <PrivateRoute>
                  <AnalysisPage />
                </PrivateRoute>
              } />
              <Route path="/calendar" element={
                <PrivateRoute>
                  <CalendarPage />
                </PrivateRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CycleProvider>
    </ThemeProvider>
  );
}
