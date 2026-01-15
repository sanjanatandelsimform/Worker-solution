import { useTheme } from '../providers/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return '☀️ Light';
      case 'dark':
        return '🌙 Dark';
      case 'system':
        return '💻 System';
      default:
        return 'Theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-lg bg-secondary text-primary hover:bg-tertiary transition-colors"
      aria-label="Toggle theme"
    >
      {getThemeLabel()}
    </button>
  );
}
