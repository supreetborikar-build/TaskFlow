import React, { useState } from 'react';
import { 
  FolderKanban, CheckSquare, Clock, AlertCircle, 
  Brain, TrendingUp, Activity 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useProjectStore } from '../store/useProjectStore';
import { calculateProjectMetrics, getSmartPrioritization } from '../utils/aiEngine';
import { AIInsightCard } from '../components/AIInsightCard';
import { TaskModal } from '../components/TaskModal';
import { UserAvatar } from '../components/UserAvatar';

export const Dashboard: React.FC = () => {
  const { projects, tasks, team, logs, getAlerts } = useProjectStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Compute metrics dynamically
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'testing');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  // Dynamic average project health score
  const activeMetrics = activeProjects.map(p => calculateProjectMetrics(p, tasks, team));
  const avgHealth = activeMetrics.length > 0
    ? Math.round(activeMetrics.reduce((acc, curr) => acc + curr.healthScore, 0) / activeMetrics.length)
    : 100;
  
  const delayedProjectsCount = activeMetrics.filter(m => m.predictedDelayDays > 0).length;
  const totalRisks = getAlerts().length;

  // Chart 1: Team workload (total hours for active tasks)
  const workloadData = team.map(member => {
    const memberTasks = tasks.filter(t => t.assigneeId === member.id && t.status !== 'done');
    const totalEstimate = memberTasks.reduce((acc, t) => acc + t.timeEstimate, 0);
    return {
      name: member.name.split(' ')[0],
      hours: totalEstimate,
      tasks: memberTasks.length,
    };
  });

  // Chart 2: Task Completion Trend (mocked data over past 7 days)
  const completionTrendData = [
    { date: 'Jul 10', completed: 2, created: 3 },
    { date: 'Jul 11', completed: 4, created: 2 },
    { date: 'Jul 12', completed: 3, created: 5 },
    { date: 'Jul 13', completed: 5, created: 4 },
    { date: 'Jul 14', completed: 6, created: 3 },
    { date: 'Jul 15', completed: 7, created: 6 },
    { date: 'Jul 16', completed: completedTasks % 10 + 2, created: totalTasks % 10 + 1 },
  ];

  // Get next 3 urgent tasks
  const smartTasks = getSmartPrioritization(tasks, projects).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Workspace Summary
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            System status as of July 16, 2026. Real-time metrics.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-5 shadow-enterprise flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">
              Active Projects
            </span>
            <p className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
              {activeProjects.length}
            </p>
            <span className="text-[10px] text-enterprise-textMuted dark:text-dark-textMuted">
              Across {projects.length} total repositories
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-accent flex items-center justify-center shrink-0">
            <FolderKanban size={22} />
          </div>
        </div>

        {/* Tasks Progress */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-5 shadow-enterprise flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">
              Tasks Completed
            </span>
            <p className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
              {completedTasks}
              <span className="text-xs font-normal text-enterprise-textSecondary dark:text-dark-textSecondary ml-1">
                / {totalTasks}
              </span>
            </p>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1">
              <div 
                className="bg-success h-1.5 rounded-full" 
                style={{ width: `${Math.round((completedTasks / (totalTasks || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-950/20 text-success flex items-center justify-center shrink-0">
            <CheckSquare size={22} />
          </div>
        </div>

        {/* Predicted Delays */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-5 shadow-enterprise flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">
              Delayed Projects
            </span>
            <p className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
              {delayedProjectsCount}
            </p>
            <span className="text-[10px] text-danger font-medium flex items-center gap-1">
              <AlertCircle size={10} /> Active scheduling risk
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-warning flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
        </div>

        {/* AI Health Score */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-5 shadow-enterprise flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">
              AI Risk Index
            </span>
            <p className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary">
              {totalRisks}
              <span className="text-xs font-normal text-enterprise-textSecondary dark:text-dark-textSecondary ml-1">
                threats
              </span>
            </p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              totalRisks > 5 ? 'bg-red-50 dark:bg-red-950/20 text-danger' : 
              totalRisks > 2 ? 'bg-amber-50 dark:bg-amber-950/20 text-warning' : 
              'bg-green-50 dark:bg-green-950/20 text-success'
            }`}>
              {totalRisks > 5 ? 'High Risk' : totalRisks > 2 ? 'Medium Risk' : 'Low Risk'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Brain size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Cards & AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Charts & Workloads) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Circular average health dial + Charts Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Project Health Score Circular dial widget */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-5 shadow-enterprise flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary mb-3">
                Average Project Health
              </span>
              
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* SVG Circular Dial */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-slate-100 dark:stroke-slate-800" 
                    strokeWidth="8" fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className={`stroke-current ${
                      avgHealth > 80 ? 'text-success' : 
                      avgHealth > 60 ? 'text-warning' : 'text-danger'
                    }`} 
                    strokeWidth="8" fill="transparent" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * avgHealth) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-extrabold text-enterprise-textPrimary dark:text-dark-textPrimary">
                    {avgHealth}%
                  </span>
                </div>
              </div>
              
              <span className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary mt-3">
                Weighted by pending blockers
              </span>
            </div>

            {/* Task Completion Trend Area Chart */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-5 shadow-enterprise md:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">
                  Task Completion Trend
                </span>
                <span className="text-[10px] text-success font-medium flex items-center gap-0.5">
                  <TrendingUp size={10} /> +12% vs last week
                </span>
              </div>
              
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={completionTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="completed" name="Done" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Workload Distribution Chart */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-5 shadow-enterprise">
            <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider mb-4">
              Team Workload Overview (Hours Assigned)
            </h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#94A3B8' } }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="hours" name="Active Hours" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-enterprise-textMuted dark:text-dark-textMuted text-center mt-2">
              Hours reflect estimated complexity of active, in-progress, and QA tasks. Maximum threshold is 40 hours.
            </p>
          </div>

          {/* Smart Task Prioritization list */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-6 shadow-enterprise">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-accent" />
              <h3 className="font-semibold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">
                AI Prioritized Backlog Next Up
              </h3>
            </div>

            <div className="divide-y divide-enterprise-border dark:divide-dark-border">
              {smartTasks.map(task => {
                const projName = projects.find(p => p.id === task.projectId)?.name || 'Unknown';
                const assigneeName = team.find(t => t.id === task.assigneeId)?.name || 'Unassigned';
                
                return (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {projName}
                        </span>
                        <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                          task.priority === 'critical' ? 'bg-red-50 dark:bg-red-950/20 text-danger' : 
                          task.priority === 'high' ? 'bg-amber-50 dark:bg-amber-950/20 text-warning' : 
                          'bg-blue-50 dark:bg-blue-950/20 text-accent'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs font-semibold mt-1 text-enterprise-textPrimary dark:text-dark-textPrimary truncate">
                        {task.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">
                          Due {task.dueDate}
                        </p>
                        <p className="text-[9px] text-enterprise-textMuted dark:text-dark-textMuted">
                          {task.timeEstimate}h estimate
                        </p>
                      </div>
                      <UserAvatar name={assigneeName} className="w-7 h-7 text-[8px]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: AI Risk Panel + Recent Activity */}
        <div className="space-y-6">
          
          {/* AI Insights Card */}
          <AIInsightCard />

          {/* Recent Activity Logs */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-enterprise-border dark:border-dark-border p-6 shadow-enterprise">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-enterprise-textSecondary dark:text-dark-textSecondary" />
              <h3 className="font-semibold text-sm text-enterprise-textPrimary dark:text-dark-textPrimary">
                Recent Workspace Activity
              </h3>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {logs.slice(0, 8).map(log => (
                <div key={log.id} className="flex gap-2.5 items-start text-xs">
                  <UserAvatar name={log.userName} className="w-7 h-7 text-[8px] mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-enterprise-textPrimary dark:text-dark-textPrimary leading-normal">
                      <span className="font-semibold">{log.userName}</span> {log.action}
                    </p>
                    <span className="text-[9px] text-enterprise-textMuted dark:text-dark-textMuted mt-0.5 block">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Task Modal Details drawer */}
      {selectedTaskId && (
        <TaskModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
};
export default Dashboard;
