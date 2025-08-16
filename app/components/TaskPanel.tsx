'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Check, Edit } from 'lucide-react';
import { getAccentHex } from '../utils/colors';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskPanelProps {
  accentColor: string; // e.g. "text-green-400"
  IconButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }>;
}

const storageKey = 'dsk_tasks_v1';

const TaskPanel: React.FC<TaskPanelProps> = ({ accentColor, IconButton }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [deleted, setDeleted] = useState<{ task: Task; index: number } | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  // load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setTasks(JSON.parse(raw));
    } catch {
      /* ignore parse errors */
    }
  }, []);

  // persist tasks
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  }, [tasks]);

  // clean up undo timer if unmounted
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    };
  }, []);

  const addTask = () => {
    setError('');
    const trimmed = newTask.trim();
    if (!trimmed) {
      setError('Please enter a task.');
      return;
    }
    const t: Task = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, text: trimmed, completed: false };
    setTasks((s) => [...s, t]);
    setNewTask('');
    // auto-scroll or focus could be added later
  };

  const toggleTaskCompletion = (index: number) => {
    setTasks((prev) => {
      const p = [...prev];
      p[index] = { ...p[index], completed: !p[index].completed };
      return p;
    });
  };

  const removeTask = (index: number) => {
    setTasks((prev) => {
      const p = [...prev];
      const removed = p.splice(index, 1)[0];
      // save deleted to allow undo
      setDeleted({ task: removed, index });
      // start undo timer
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = window.setTimeout(() => setDeleted(null), 5000);
      return p;
    });
  };

  const undoRemove = () => {
    if (!deleted) return;
    setTasks((prev) => {
      const p = [...prev];
      p.splice(deleted.index, 0, deleted.task);
      return p;
    });
    setDeleted(null);
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(tasks[index].text);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editingText.trim();
    if (!trimmed) {
      // treat empty edit as remove
      removeTask(editingIndex);
      setEditingIndex(null);
      setEditingText('');
      return;
    }
    setTasks((prev) => {
      const p = [...prev];
      p[editingIndex] = { ...p[editingIndex], text: trimmed };
      return p;
    });
    setEditingIndex(null);
    setEditingText('');
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  // derive a bg class from accentColor (text-green-400 -> bg-green-400)
  // NOTE: ensure your Tailwind config/jit safelists these bg-* classes if needed.
  const accentBg = accentColor.replace(/^text-/, 'bg-');

  return (
    <div className="p-4 sm:p-6 border-2 rounded-xl border-gray-700 flex flex-col justify-between h-full">
      {/* header + progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm sm:text-base font-medium"
                      style={{ color: getAccentHex(accentColor),  }} >
        Tasks</div>
        <div className="text-xs text-gray-400">{completed}/{total} done</div>
      </div>

      {/* progress bar */}
      <div className="w-full h-2 bg-gray-800 rounded mb-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${accentBg}`}
          style={{ width: `${percent}%` }}
          aria-hidden
        />
      </div>

      {/* add */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          aria-label="Add task"
          type="text"
          placeholder="Add a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="flex-grow bg-transparent border-b-2 border-gray-600 focus:outline-none focus:border-current py-1 px-2 text-sm sm:text-base"
        />
        <IconButton onClick={addTask} className="p-1" >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </IconButton>
      </div>
      {error && <div className="text-xs text-red-500 mb-2">{error}</div>}

      {/* list */}
        <div role="list" className="space-y-1 text-sm text-gray-300 overflow-y-auto mb-3 flex-grow">
        {tasks.length === 0 && <p className="text-gray-500 italic">No tasks yet.</p>}
        {tasks.map((task, index) => (
          <div
            role="listitem"
            key={task.id}
            className={`flex items-center justify-between px-2 py-1 rounded transition-colors duration-150 ${task.completed ? 'opacity-70' : 'hover:bg-gray-800'}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                aria-pressed={task.completed}
                onClick={() => toggleTaskCompletion(index)}
                className={`flex items-center justify-center w-7 h-7 rounded ${task.completed ? `${accentBg} text-black` : 'border border-gray-600'}`}
                title={task.completed ? 'Mark as not done' : 'Mark as done'}
              >
                {task.completed ? <Check className="w-4 h-4" /> : null}
              </button>

              {/* label or inline edit */}
              {editingIndex === index ? (
                <input
                  className="bg-transparent focus:outline-none border-b border-current text-sm truncate flex-1"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') { setEditingIndex(null); setEditingText(''); }
                  }}
                  onBlur={commitEdit}
                  autoFocus
                />
              ) : (
                <button
                  className={`flex-grow text-left truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}
                  onDoubleClick={() => startEdit(index)}
                  onClick={() => toggleTaskCompletion(index)}
                  title="Click to toggle complete · Double-click to edit"
                >
                  {task.text}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-2">
              <IconButton onClick={() => { startEdit(index); }} className="p-1" >
                <Edit className="w-4 h-4" />
              </IconButton>
              <IconButton onClick={() => removeTask(index)} className="p-1" >
                <Trash className="w-4 h-4" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      {/* footer actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-400">Tip: Enter to add · Double-click to edit</div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearCompleted}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear completed
          </button>
        </div>
      </div>

      {/* undo snackbar */}
      {deleted && (
        <div className="fixed bottom-6 right-6 p-3 bg-gray-900 border border-gray-700 rounded shadow-lg flex items-center gap-3 z-50">
          <div className="text-sm text-gray-200 truncate max-w-xs">{`Deleted: ${deleted.task.text}`}</div>
          <button
            onClick={undoRemove}
            className={`px-3 py-1 rounded text-sm ${accentBg} text-black font-medium`}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskPanel;
