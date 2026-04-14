import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Calendar, Moon, Sun, Eye, EyeOff, Heart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/analysis', icon: BarChart3, label: 'Analysis' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
];

export default function Sidebar() {
  const { theme, toggleTheme, privacyMode, togglePrivacy } = useTheme();

  return (
    <aside className="sidebar" id="sidebar-navigation">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Heart size={24} fill="var(--pink-500)" color="var(--pink-500)" />
          <span className="sidebar-brand">Darine's Tracker</span>
        </div>
        <p className="sidebar-tagline">Personal menstrual tracker</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            end={item.to === '/'}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-toggle-btn" onClick={toggleTheme} title="Toggle dark mode">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button className="sidebar-toggle-btn" onClick={togglePrivacy} title="Toggle privacy mode">
          {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
          <span>{privacyMode ? 'Privacy On' : 'Privacy Off'}</span>
        </button>
      </div>
    </aside>
  );
}
