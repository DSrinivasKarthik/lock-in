'use client';

import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';

interface Task {
  text: string;
  completed: boolean;
}

interface TaskPanelProps {
  accentColor: string;
  IconButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }>;
}

const TaskPanel: React.FC<TaskPanelProps> = ({ accentColor, IconButton }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { text: newTask.trim(), completed: false }]);
    setNewTask('');
  };

  const toggleTaskCompletion = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 sm:p-6 border-2 rounded-xl border-gray-700 flex flex-col justify-between min-h-[300px]">
      {/* Add Task */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          placeholder="Add a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-grow bg-transparent border-b-2 border-gray-600 focus:outline-none focus:border-current py-1 px-2 text-sm sm:text-base"
        />
        <IconButton onClick={handleAddTask} className="p-1">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </IconButton>
      </div>

      {/* Task List */}
      <div className="space-y-1 text-sm text-gray-300 max-h-40 overflow-y-auto">
        {tasks.length === 0 && <p className="text-gray-500 italic">No tasks yet.</p>}
        {tasks.map((task, index) => (
          <div
            key={index}
            className={`flex items-center justify-between px-2 py-1 rounded ${
              task.completed ? 'line-through text-gray-500' : ''
            } ${accentColor}`}
          >
            <button
              className="flex-grow text-left truncate"
              onClick={() => toggleTaskCompletion(index)}
            >
              {task.text}
            </button>
           <button
                    onClick={() => handleRemoveTask(index)}
                    className="text-gray-600 hover:text-red-400 text-xs"
                  >
                    [x]
                  </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskPanel;
