import React from 'react';
import { useTheme } from '../../utils/ThemeContext';
import { 
  Sun, 
  Moon, 
  Bell, 
  Settings, 
  User, 
  Search,
  Menu,
  X
} from 'lucide-react';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-background border-b border-border-primary sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
              ) : (
                <Menu className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
              )}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LR</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gradient-primary">
                  LIDAR Reporting
                </h1>
                <p className="text-xs text-secondary-600 dark:text-secondary-400">
                  Automation System
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search reports, schedules..."
                className="w-full pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
              ) : (
                <Moon className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
              )}
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive-500 rounded-full border-2 border-background"></span>
            </button>

            {/* Settings */}
            <button
              className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
            </button>

            {/* User Profile */}
            <button
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="User profile"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-secondary-900 dark:text-secondary-100">
                Admin User
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileMenuOpen && (
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search reports, schedules..."
                className="w-full pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
