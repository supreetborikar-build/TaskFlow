import React, { useState } from 'react';
import { CheckSquare, Trash2, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export const Notifications: React.FC = () => {
  const { 
    notifications, markNotificationRead, markAllNotificationsRead, clearNotifications 
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.severity === activeTab;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <ShieldAlert className="text-danger shrink-0 mt-0.5" size={16} />;
      case 'medium':
        return <AlertTriangle className="text-warning shrink-0 mt-0.5" size={16} />;
      default:
        return <Info className="text-accent shrink-0 mt-0.5" size={16} />;
    }
  };

  const getSeverityStyle = (severity: string, read: boolean) => {
    if (read) return 'border-enterprise-border dark:border-dark-border opacity-70';
    switch (severity) {
      case 'high':
        return 'border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/5';
      case 'medium':
        return 'border-amber-200 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/5';
      default:
        return 'border-blue-200 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Notification Log
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            System diagnostics, security scans, and scheduling deviations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-enterprise-textPrimary dark:text-dark-textPrimary rounded-lg text-xs font-semibold border border-enterprise-border dark:border-dark-border transition-colors"
              >
                <CheckSquare size={13} />
                Mark all read
              </button>
              
              <button
                onClick={clearNotifications}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-danger rounded-lg text-xs font-semibold border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 transition-colors"
              >
                <Trash2 size={13} />
                Clear Log
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-enterprise-border dark:border-dark-border no-print">
        {(['all', 'high', 'medium', 'low'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 capitalize transition-all ${
              activeTab === tab 
                ? 'border-accent text-accent' 
                : 'border-transparent text-enterprise-textSecondary dark:text-dark-textSecondary hover:text-enterprise-textPrimary'
            }`}
          >
            {tab} Alerts ({tab === 'all' ? notifications.length : notifications.filter(n => n.severity === tab).length})
          </button>
        ))}
      </div>

      {/* Notification items */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-12 text-center shadow-enterprise flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="text-success" size={32} />
            <div>
              <h3 className="font-bold text-xs text-enterprise-textPrimary dark:text-dark-textPrimary">All alerts cleared</h3>
              <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">No alerts found under active selection.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-4 bg-white dark:bg-dark-card border rounded-lg shadow-enterprise flex items-start gap-3.5 cursor-pointer hover:shadow-enterpriseHover transition-all ${getSeverityStyle(notif.severity, notif.read)}`}
            >
              {getSeverityIcon(notif.severity)}
              
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-enterprise-textPrimary dark:text-dark-textPrimary">
                    {notif.title}
                  </span>
                  <span className="text-[9px] font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                    {notif.severity} Severity
                  </span>
                  {!notif.read && (
                    <span className="px-1.5 py-0.5 rounded bg-accent text-white text-[8px] font-bold uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {notif.message}
                </p>
                
                <span className="text-[9px] text-enterprise-textMuted dark:text-dark-textMuted block pt-1.5">
                  Logged: {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
export default Notifications;
