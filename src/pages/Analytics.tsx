import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { BarChart3, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export const Analytics: React.FC = () => {
  const { team, tasks } = useProjectStore();

  // Chart 1: Sprint Velocity (Comparing Estimated Scope vs Completed Scope)
  // Mock data representing Sprints 10, 11, 12, and active Sprint 13
  const velocityData = [
    { name: 'Sprint 10', estimated: 80, completed: 78 },
    { name: 'Sprint 11', estimated: 95, completed: 90 },
    { name: 'Sprint 12', estimated: 110, completed: 108 },
    { name: 'Sprint 13 (Active)', estimated: 120, completed: 62 }, // sprint in progress
  ];

  // Chart 2: Resource Utilization (Hours assigned vs Capacity limits)
  const resourceData = team.map(member => {
    const activeTasks = tasks.filter(t => t.assigneeId === member.id && t.status !== 'done');
    const assignedHours = activeTasks.reduce((acc, t) => acc + t.timeEstimate, 0);
    return {
      name: member.name.split(' ')[0],
      assigned: assignedHours,
      capacity: member.maxHoursPerWeek,
    };
  });

  // Chart 3: Project Health Timeline (Tracking Health Scores over Sprints)
  const healthTimelineData = [
    { name: 'Sprint 10', Apollo: 95, Titan: 90, Nova: 100 },
    { name: 'Sprint 11', Apollo: 88, Titan: 85, Nova: 95 },
    { name: 'Sprint 12', Apollo: 82, Titan: 80, Nova: 98 },
    { name: 'Sprint 13 (Current)', Apollo: 68, Titan: 50, Nova: 92 },
  ];

  // Chart 4: Task Priority Distribution
  const priorityDistribution = [
    { name: 'Critical', value: tasks.filter(t => t.priority === 'critical').length, fill: '#EF4444' },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, fill: '#F59E0B' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, fill: '#2563EB' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, fill: '#64748B' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Workspace Insights & Analytics
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            Review detailed metrics, resource utilization, and sprint velocities.
          </p>
        </div>
      </div>

      {/* Analytics KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-5 shadow-enterprise flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-accent rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-bold tracking-wider">Average Velocity</p>
            <p className="text-lg font-bold text-enterprise-textPrimary dark:text-dark-textPrimary mt-0.5">92.5 hrs/sprint</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-5 shadow-enterprise flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 text-success rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-bold tracking-wider">Resource Allocation</p>
            <p className="text-lg font-bold text-enterprise-textPrimary dark:text-dark-textPrimary mt-0.5">82.4% capacity</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-5 shadow-enterprise flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-danger rounded-lg">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary uppercase font-bold tracking-wider">Sprint Rollovers</p>
            <p className="text-lg font-bold text-enterprise-textPrimary dark:text-dark-textPrimary mt-0.5">3 task rollover risk</p>
          </div>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sprint Velocity Chart */}
        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise">
          <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart3 size={14} />
            Sprint Velocity Comparison (Hours)
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="estimated" name="Scope Estimated" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={25} />
                <Bar dataKey="completed" name="Scope Completed" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Allocation Chart */}
        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise">
          <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart3 size={14} />
            Resource Utilization (Work hours vs Capacity)
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="assigned" name="Assigned Workload" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="capacity" name="Max capacity" fill="#E2E8F0" radius={[4, 4, 0, 0]} maxBarSize={20} className="dark:fill-slate-800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Health Score Line Chart */}
        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise">
          <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart3 size={14} />
            Historical Project Health Index (%)
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTimelineData} margin={{ top: 5, right: 15, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="Apollo" name="Apollo Portal" stroke="#2563EB" strokeWidth={2} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Titan" name="Titan DB Migration" stroke="#EF4444" strokeWidth={2} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Nova" name="Nova Mobile" stroke="#22C55E" strokeWidth={2} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Priority Distribution Bar Chart */}
        <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl p-6 shadow-enterprise">
          <h3 className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart3 size={14} />
            Active Tickets By Priority Status
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Bar dataKey="value" name="Active Tickets" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Analytics;
