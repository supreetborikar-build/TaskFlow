import React from 'react';
import { Brain, AlertTriangle, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { getResourceRecommendations } from '../utils/aiEngine';

export const AIInsightCard: React.FC = () => {
  const { 
    projects, tasks, team, sprints, updateTask, getAlerts, addLog 
  } = useProjectStore();

  const alerts = getAlerts();
  const recommendations = getResourceRecommendations(tasks, team, projects, sprints);

  const handleApplyRecommendation = (_recId: string, taskId: string, newAssigneeId: string, newAssigneeName: string) => {
    updateTask(taskId, { assigneeId: newAssigneeId });
    addLog(`applied AI suggestion: reassigned task to ${newAssigneeName}`, 'task', tasks.find(t => t.id === taskId)?.title || 'Task');
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-950/20 text-danger border-red-100 dark:border-red-900/30';
      case 'medium':
        return 'bg-amber-50 dark:bg-amber-950/20 text-warning border-amber-100 dark:border-amber-900/30';
      default:
        return 'bg-blue-50 dark:bg-blue-950/20 text-accent border-blue-100 dark:border-blue-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk alerts panel */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-6 shadow-enterprise">
        <div className="flex items-center gap-2.5 mb-4">
          <Brain size={20} className="text-accent" />
          <h3 className="font-semibold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">
            AI Risk & Bottleneck Analysis
          </h3>
          <span className="ml-auto text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
            Active Scan: Real-time
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="py-6 text-center text-sm text-enterprise-textSecondary dark:text-dark-textSecondary flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="text-success" size={24} />
            No risks or bottlenecks identified in active projects.
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3.5 border rounded-lg flex items-start gap-3 transition-colors ${getSeverityStyles(alert.severity)}`}
              >
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs capitalize">
                      [{alert.type.replace('_', ' ')}]
                    </span>
                    {alert.projectName && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-medium">
                        {alert.projectName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {alert.message}
                  </p>
                  <p className="text-[10px] mt-1.5 opacity-90 leading-normal italic">
                    <span className="font-semibold not-italic">AI Rec:</span> {alert.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resource Optimization panel */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-6 shadow-enterprise">
        <div className="flex items-center gap-2.5 mb-4">
          <Brain size={20} className="text-success" />
          <h3 className="font-semibold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">
            AI Resource Optimization
          </h3>
          <span className="ml-auto text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
            Load Balancer Engine
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="py-6 text-center text-xs text-enterprise-textSecondary dark:text-dark-textSecondary leading-normal">
            Workload distribution is balanced. No reallocations recommended.
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div 
                key={rec.id}
                className="p-4 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                      Workload Swap Recommendation
                    </span>
                    <span className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {rec.projectName}
                    </span>
                  </div>
                  <p className="text-xs font-semibold mt-1 text-enterprise-textPrimary dark:text-dark-textPrimary leading-normal">
                    Reassign task "{rec.taskTitle}"
                  </p>
                  <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-enterprise-border dark:border-dark-border">
                  <div className="flex items-center gap-1.5 text-xs text-enterprise-textSecondary dark:text-dark-textSecondary">
                    <span className="font-medium">{rec.overloadedMemberName}</span>
                    <ArrowRight size={12} className="text-enterprise-textMuted" />
                    <span className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">{rec.suggestedMemberName}</span>
                  </div>
                  
                  <button
                    onClick={() => handleApplyRecommendation(rec.id, rec.taskId, rec.suggestedMemberId, rec.suggestedMemberName)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors shadow-xs"
                  >
                    <UserPlus size={12} />
                    Apply Swap
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AIInsightCard;
