import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { TaskModal } from '../components/TaskModal';

export const Calendar: React.FC = () => {
  const { tasks, projects } = useProjectStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // We will build a calendar for July 2026.
  // July 1, 2026 is a Wednesday.
  // July has 31 days.
  // We need to render the grid cells.
  const daysInJuly = 31;
  const startDayOffset = 2; // Wednesday is index 2 (Mon=0, Tue=1, Wed=2)
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const cells: (number | null)[] = [];
  
  // Fill leading empty cells
  for (let i = 0; i < startDayOffset; i++) {
    cells.push(null);
  }
  
  // Fill July days
  for (let d = 1; d <= daysInJuly; d++) {
    cells.push(d);
  }
  
  // Fill trailing cells to complete grid row (multiple of 7)
  const remaining = 35 - cells.length; // or 42
  const totalCells = cells.length + (remaining > 0 ? remaining : (42 - cells.length));
  
  for (let i = cells.length; i < totalCells; i++) {
    cells.push(null);
  }

  // Get tasks that are due on a specific day in July 2026
  const getTasksForDay = (day: number) => {
    const dateStr = `2026-07-${day.toString().padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 text-danger border-red-200 dark:bg-red-950/30';
      case 'high': return 'bg-amber-50 text-warning border-amber-200 dark:bg-amber-950/30';
      default: return 'bg-blue-50 text-accent border-blue-200 dark:bg-blue-950/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-enterprise-textPrimary dark:text-dark-textPrimary tracking-tight">
            Workspace Schedule
          </h1>
          <p className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary mt-1">
            Visual calendar mapping due dates, blockers, and launch targets.
          </p>
        </div>

        <div className="flex items-center gap-3 border border-enterprise-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-card p-1">
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-enterprise-textSecondary">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold px-2 text-enterprise-textPrimary dark:text-dark-textPrimary">
            July 2026
          </span>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-enterprise-textSecondary">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-xl shadow-enterprise overflow-hidden">
        
        {/* Days of week titles */}
        <div className="grid grid-cols-7 border-b border-enterprise-border dark:border-dark-border text-center bg-slate-50 dark:bg-slate-900/30 py-2.5">
          {weekDays.map(day => (
            <span key={day} className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">
              {day}
            </span>
          ))}
        </div>

        {/* 35/42 Cell grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-enterprise-border dark:divide-dark-border bg-slate-100/10">
          {cells.map((day, idx) => {
            const isToday = day === 16; // July 16, 2026 is today in mock timeline
            const dayTasks = day ? getTasksForDay(day) : [];

            return (
              <div 
                key={idx}
                className={`min-h-[110px] p-2.5 flex flex-col justify-between transition-colors bg-white dark:bg-dark-card ${
                  day === null ? 'bg-slate-50/50 dark:bg-slate-950/10' : ''
                } ${isToday ? 'ring-2 ring-inset ring-accent' : ''}`}
              >
                {/* Day number */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${
                    isToday 
                      ? 'bg-accent text-white px-2 py-0.5 rounded-full' 
                      : 'text-enterprise-textPrimary dark:text-dark-textPrimary'
                  } ${day === null ? 'opacity-25' : ''}`}>
                    {day}
                  </span>
                  
                  {isToday && (
                    <span className="text-[8px] uppercase font-bold text-accent tracking-wider hidden sm:inline">
                      Today
                    </span>
                  )}
                </div>

                {/* Day Task Badges list */}
                <div className="flex-grow mt-2 space-y-1 overflow-y-auto max-h-[70px]">
                  {dayTasks.map(task => {
                    const proj = projects.find(p => p.id === task.projectId);
                    return (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`w-full text-left p-1 border text-[9px] font-semibold rounded truncate leading-normal block transition-transform hover:scale-[1.01] ${getPriorityColor(task.priority)}`}
                        title={`[${proj?.name}] ${task.title}`}
                      >
                        {task.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {selectedTaskId && (
        <TaskModal 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
};
export default Calendar;
