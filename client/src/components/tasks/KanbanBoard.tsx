import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddTask?: (defaultStatus?: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; title: string; colorClass: string; badgeClass: string }[] = [
  {
    id: 'TODO',
    title: 'To Do',
    colorClass: 'border-slate-200 bg-slate-50/50',
    badgeClass: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    colorClass: 'border-pink-200 bg-pink-50/40',
    badgeClass: 'bg-pink-100 text-pink-700 font-semibold',
  },
  {
    id: 'IN_REVIEW',
    title: 'In Review',
    colorClass: 'border-purple-200 bg-purple-50/30',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'DONE',
    title: 'Done',
    colorClass: 'border-emerald-200 bg-emerald-50/30',
    badgeClass: 'bg-emerald-100 text-emerald-700 font-semibold',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onAddTask,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setActiveDropCol(null);
    setDraggedTaskId(null);

    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetStatus) {
        onStatusChange(taskId, targetStatus);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isTarget = activeDropCol === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-2xl border p-3.5 transition-all flex flex-col min-h-[480px] ${
              col.colorClass
            } ${
              isTarget
                ? 'ring-2 ring-rose-500 bg-rose-50/80 shadow-pink-md scale-[1.01]'
                : 'shadow-sm shadow-pink-100/20'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-rose-100/70">
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold tracking-wide text-slate-800 uppercase">
                  {col.title}
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeClass}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {onAddTask && (
                <button
                  onClick={() => onAddTask(col.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Task list container */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-rose-200/60 rounded-xl flex items-center justify-center text-xs text-slate-400 italic">
                  Drag tasks here
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab active:cursor-grabbing transform transition-transform hover:-translate-y-0.5"
                  >
                    <TaskCard
                      task={task}
                      onStatusChange={onStatusChange}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
