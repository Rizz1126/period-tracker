import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Calendar } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/analysis', icon: BarChart3, label: 'Analysis' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" id="bottom-navigation">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          end={item.to === '/'}
        >
          <item.icon size={22} strokeWidth={2} />
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
