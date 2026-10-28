import React, { useState } from 'react';
import { ShieldCheck, HardDrive, CheckCircle2 } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export const Settings: React.FC = () => {
  const { addLog } = useProjectStore();

  const [workspaceName, setWorkspaceName] = useState('Enterprise Default Co.');
  const [complexityUnit, setComplexityUnit] = useState<'hours' | 'points'>('hours');
  const [githubSync, setGithubSync] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [awsAutoscale, setAwsAutoscale] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    addLog(`updated workspace settings properties`, 'system', 'Workspace Settings');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="no-print">
        <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
          Workspace Preferences
        </h1>
        <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
          Adjust default complexity limits, mock cloud hooks, and user boundaries.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 border border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-950/10 text-success rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in no-print">
          <CheckCircle2 size={16} />
          Workspace configurations updated successfully.
        </div>
      )}

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Settings Form */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Workspace Properties */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">
                1. Workspace Details
              </h3>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Company Organization Name</label>
                <input 
                  type="text" 
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 focus:bg-white text-xs font-medium"
                />
              </div>
            </div>

            {/* Backlog complexity defaults */}
            <div className="space-y-3 pt-6 border-t border-enterprise-border dark:border-dark-border">
              <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">
                2. Project Backlog Options
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary block">Task Estimation Metrics</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input 
                      type="radio" 
                      name="complexity" 
                      checked={complexityUnit === 'hours'}
                      onChange={() => setComplexityUnit('hours')}
                      className="text-accent focus:ring-accent w-4 h-4"
                    />
                    Hourly Track (Actual/Estimated Hours)
                  </label>
                  
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input 
                      type="radio" 
                      name="complexity" 
                      checked={complexityUnit === 'points'}
                      onChange={() => setComplexityUnit('points')}
                      className="text-accent focus:ring-accent w-4 h-4"
                    />
                    Agile Story Points (Fibonacci scale)
                  </label>
                </div>
              </div>
            </div>

            {/* Mock Sync integrations */}
            <div className="space-y-3 pt-6 border-t border-enterprise-border dark:border-dark-border">
              <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">
                3. Connected DevOps Systems (Simulation)
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 text-xs font-medium cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={githubSync}
                    onChange={e => setGithubSync(e.target.checked)}
                    className="rounded text-accent focus:ring-accent w-4 h-4 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">Auto-Sync GitHub Commit PRs</p>
                    <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary mt-0.5 leading-normal">
                      Closes tasks automatically when commit message references ticket number (e.g. "Closes #task-102").
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 text-xs font-medium cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={slackAlerts}
                    onChange={e => setSlackAlerts(e.target.checked)}
                    className="rounded text-accent focus:ring-accent w-4 h-4 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">Forward High AI Risk Alerts to Slack</p>
                    <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary mt-0.5 leading-normal">
                      Pushes instant workspace risk detections directly into team dashboard chat channels.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 text-xs font-medium cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={awsAutoscale}
                    onChange={e => setAwsAutoscale(e.target.checked)}
                    className="rounded text-accent focus:ring-accent w-4 h-4 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">AWS DMS Health Watcher</p>
                    <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary mt-0.5 leading-normal">
                      Checks for migration lag warnings on active Aurora database clusters.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-enterprise-border dark:border-dark-border flex justify-end">
              <button 
                type="submit"
                className="px-4 py-2 bg-accent hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                Save Settings
              </button>
            </div>

          </form>
        </div>

        {/* Right 1 Column: System info */}
        <div className="space-y-6">
          {/* Security details */}
          <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-5 shadow-enterprise space-y-4">
            <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-success" />
              Workspace Boundaries
            </h3>

            <div className="space-y-3 text-xs leading-normal">
              <div>
                <p className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">Encryption Standard</p>
                <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary">AES-256 KMS Key encrypted session stores</p>
              </div>
              
              <div>
                <p className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">Role Authorization</p>
                <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary">RBAC Admin tier controls active</p>
              </div>

              <div>
                <p className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">SOC 2 Type II Status</p>
                <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary">Compliance validated through pen-test audits</p>
              </div>
            </div>
          </div>

          {/* Database stats */}
          <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-5 shadow-enterprise space-y-3">
            <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive size={14} />
              Telemetry Database Size
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-enterprise-border dark:border-dark-border py-1">
                <span className="text-enterprise-textSecondary dark:text-dark-textSecondary">Allocated Table space</span>
                <span className="font-bold">4.2 MB</span>
              </div>
              <div className="flex justify-between items-center border-b border-enterprise-border dark:border-dark-border py-1">
                <span className="text-enterprise-textSecondary dark:text-dark-textSecondary">Replication Lag</span>
                <span className="font-bold text-success">&lt;0.05 seconds</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-enterprise-textSecondary dark:text-dark-textSecondary">Active Index Hits</span>
                <span className="font-bold">99.8%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Settings;
