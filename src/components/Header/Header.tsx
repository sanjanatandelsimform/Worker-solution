import React from 'react';
import styles from './Header.module.css';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  appName: string;
  navItems?: NavItem[];
}

const Header: React.FC<HeaderProps> = ({ appName, navItems = [] }) => {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>{appName}</span>
      {navItems.length > 0 && (
        <nav aria-label="Main navigation">
          <ul className={styles.nav}>
            {navItems.map((item) => (
              <li key={item.href} className={styles.navItem}>
                <a href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
