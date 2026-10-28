import React, { useState } from 'react';
import { Calendar, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProjectStore } from '../store/useProjectStore';
import { calculateSprintAnalytics } from '../utils/aiEngine';
import { TaskModal } from '../components/TaskModal';
import { UserAvatar } from '../components/UserAvatar';

export const SprintBoard: React.FC = () => {
  const { sprints, tasks, team, projects } = useProjectStore();
  const [selectedSprintId, setSelectedSprintId] = useState<string>(sprints.find(s => s.status === 'active')?.id || sprints[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedSprint = sprints.find(s => s.id === selectedSprintId);
  const sprintTasks = tasks.filter(t => t.sprintId === selectedSprintId);

  // Group task status counts
  const totalTasks = sprintTasks.length;
  const doneTasks = sprintTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = sprintTasks.filter(t => t.status === 'in_progress').length;
  const testingTasks = sprintTasks.filter(t => t.status === 'testing').length;
  const todoTasks = sprintTasks.filter(t => t.status === 'todo' || t.status === 'backlog').length;

  const totalEstimate = sprintTasks.reduce((acc, t) => acc + t.timeEstimate, 0);

  // Dynamic AI analytics
  const analytics = selectedSprint 
    ? calculateSprintAnalytics(selectedSprint, tasks)
    : { healthStatus: 'healthy' as const, burnDownData: [], completionPrediction: 'Sprint is on track.' };

  const getHealthBadgeStyle = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-50 text-danger border-red-100 dark:bg-red-950/20 dark:border-red-900/30';
      case 'at_risk': return 'bg-amber-50 text-warning border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30';
      default: return 'bg-green-50 text-success border-green-100 dark:bg-green-950/20 dark:border-green-900/30';
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
      case 'in_progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'testing': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Sprint Tracking
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            Analyze active sprints metrics, ideal burn downs, and rollover forecasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary font-semibold">
            Sprint Target:
          </span>
          <select
            value={selectedSprintId}
            onChange={e => setSelectedSprintId(e.target.value)}
            className="px-3 py-1.5 border border-enterprise-border dark:border-dark-border rounded bg-white text-xs font-semibold"
          >
            {sprints.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSprint ? (
        <div className="space-y-6">
          {/* Goal & Date banner */}
          <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {selectedSprint.status} Sprint
                </span>
                <span className="text-[10px] text-enterprise-textMuted dark:text-dark-textMuted flex items-center gap-1">
                  <Calendar size={12} /> {selectedSprint.startDate} to {selectedSprint.endDate}
                </span>
              </div>
              <h2 className="text-base font-bold text-enterprise-textPrimary dark:text-dark-textPrimary leading-snug">
                {selectedSprint.name}
              </h2>
              <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary leading-normal">
                <span className="font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">Goal:</span> {selectedSprint.goal}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 shrink-0 sm:border-l sm:border-enterprise-border sm:dark:border-dark-border sm:pl-6 text-center">
              <div>
                <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-bold tracking-wider">Tickets Scope</p>
                <p className="text-lg font-bold text-enterprise-textPrimary dark:text-dark-textPrimary mt-0.5">{totalTasks} cards</p>
              </div>
              <div>
                <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-bold tracking-wider">Workload Volume</p>
                <p className="text-lg font-bold text-enterprise-textPrimary dark:text-dark-textPrimary mt-0.5">{totalEstimate} hrs</p>
              </div>
            </div>
          </div>

          {/* AI Sprint Health Analysis & Burn-down */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Burn down Line Chart */}
            <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise lg:col-span-2">
              <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider mb-4">
                Sprint Burn-down (Hours Remaining)
              </h3>
              
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.burnDownData} margin={{ top: 5, right: 15, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                    <Tooltip contentStyle={{ fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="ideal" name="Ideal Trend" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="actual" name="Actual Remaining" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health Analysis Card */}
            <div className="space-y-6">
              <div className={`p-6 border rounded-xl shadow-enterprise space-y-4 ${getHealthBadgeStyle(analytics.healthStatus)}`}>
                <div className="flex items-center gap-2">
                  <Brain size={18} />
                  <h3 className="font-bold text-xs uppercase tracking-wider">AI Sprint Diagnostics</h3>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold leading-normal">
                    Sprint Health Status: <span className="uppercase">{analytics.healthStatus}</span>
                  </p>
                  <p className="text-xs opacity-90 leading-relaxed font-medium">
                    {analytics.completionPrediction}
                  </p>
                  <p className="text-[10px] opacity-80 leading-normal">
                    AI updates hourly by reviewing active backlog velocity, logs, and overdue tasks.
                  </p>
                </div>
              </div>

              {/* Status checklist */}
              <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-5 shadow-enterprise space-y-3">
                <h4 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider">Sprint Ticket Status</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-enterprise-border dark:border-dark-border">
                    <span className="text-enterprise-textSecondary dark:text-dark-textSecondary">Completed</span>
                    <span className="font-bold text-success">{doneTasks}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-enterprise-border dark:border-dark-border">
                    <span className="text-enterprise-textSecondary dark:text-dark-textSecondary">Testing / QA</span>
                    <span className="font-bold text-purple-600">{testingTasks}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-enterprise-border dark:border-dark-border">
                    <span className="text-enterprise-textSecondary dark:text-dark-textSecondary">In Progress</span>
                    <span className="font-bold text-amber-600">{inProgressTasks}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-enterprise-textSecondary dark:text-dark-textSecondary">To Do</span>
                    <span className="font-bold">{todoTasks}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sprint Task list */}
          <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl shadow-enterprise overflow-hidden">
            <div className="px-6 py-4 border-b border-enterprise-border dark:border-dark-border">
              <h3 className="font-bold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">
                Sprint Backlog Tickets ({totalTasks})
              </h3>
            </div>
            
            <div className="divide-y divide-enterprise-border dark:divide-dark-border">
              {sprintTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-enterprise-textSecondary dark:text-dark-textSecondary italic">
                  No tasks assigned to this sprint.
                </div>
              ) : (
                sprintTasks.map(task => {
                  const assignee = team.find(t => t.id === task.assigneeId);
                  const proj = projects.find(p => p.id === task.projectId);
                  
                  return (
                    <div 
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="px-6 py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {proj?.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${getTaskStatusBadge(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-enterprise-textPrimary dark:text-dark-textPrimary truncate">
                          {task.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs">
                        <div className="text-right hidden sm:block">
                          <p className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">
                            {task.timeSpent}h spent / {task.timeEstimate}h
                          </p>
                          <p className="text-[10px] text-enterprise-textMuted dark:text-dark-textMuted">
                            Due {task.dueDate}
                          </p>
                        </div>
                        <UserAvatar name={assignee?.name} className="w-7 h-7 text-[8px]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-8 text-center text-xs text-enterprise-textSecondary">Sprint details not found.</div>
      )}

      {selectedTaskId && (
        <TaskModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
};
export default SprintBoard;
