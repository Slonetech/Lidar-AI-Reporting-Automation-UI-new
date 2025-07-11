import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Shield, 
  History,
  ChevronRight,
  Settings,
  HelpCircle,
  BarChart3
} from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Trends and visual insights'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Generate and manage reports'
    },
    {
      id: 'scheduling',
      label: 'Scheduling',
      icon: Calendar,
      description: 'Schedule automated reports'
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: Shield,
      description: 'Data validation and checks'
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      description: 'Activity logs and history'
    }
  ];

  const secondaryItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System configuration'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Documentation and support'
    }
  ];

  return (
    <nav className="w-64 bg-background border-r border-border-primary h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        {/* Navigation Items */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100 border border-primary-200 dark:border-primary-800'
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-900 dark:hover:text-secondary-100'
                }`}
                aria-label={item.description}
              >
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-secondary-500 group-hover:text-secondary-700 dark:group-hover:text-secondary-300'
                  }`} 
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className={`text-xs transition-colors ${
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-secondary-500 group-hover:text-secondary-600 dark:group-hover:text-secondary-400'
                  }`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-border-primary" />

        {/* Secondary Navigation */}
        <div className="space-y-2">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-900 dark:hover:text-secondary-100"
                aria-label={item.description}
              >
                <Icon className="w-5 h-5 text-secondary-500 group-hover:text-secondary-700 dark:group-hover:text-secondary-300" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-secondary-500 group-hover:text-secondary-600 dark:group-hover:text-secondary-400">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* System Status */}
        <div className="mt-8 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-success-800 dark:text-success-200">
              System Online
            </span>
          </div>
          <p className="text-xs text-success-700 dark:text-success-300">
            All services running normally
          </p>
        </div>

        {/* Version Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            v2.1.0 • SASRA Compliance
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
