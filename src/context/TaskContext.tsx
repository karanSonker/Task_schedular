
import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, Task } from '@/hooks/useTasks';
import { useTimeEntries, useCreateTimeEntry, useStopTimeEntry, TimeEntry } from '@/hooks/useTimeEntries';

interface TaskContextType {
  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  createTask: ReturnType<typeof useCreateTask>['mutate'];
  updateTask: ReturnType<typeof useUpdateTask>['mutate'];
  deleteTask: ReturnType<typeof useDeleteTask>['mutate'];
  
  // Time entries
  timeEntries: TimeEntry[];
  timeEntriesLoading: boolean;
  createTimeEntry: ReturnType<typeof useCreateTimeEntry>['mutate'];
  stopTimeEntry: ReturnType<typeof useStopTimeEntry>['mutate'];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: timeEntries = [], isLoading: timeEntriesLoading } = useTimeEntries();
  
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  
  const createTimeEntryMutation = useCreateTimeEntry();
  const stopTimeEntryMutation = useStopTimeEntry();

  return (
    <TaskContext.Provider value={{
      tasks,
      tasksLoading,
      createTask: createTaskMutation.mutate,
      updateTask: updateTaskMutation.mutate,
      deleteTask: deleteTaskMutation.mutate,
      
      timeEntries,
      timeEntriesLoading,
      createTimeEntry: createTimeEntryMutation.mutate,
      stopTimeEntry: stopTimeEntryMutation.mutate,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

// Export types for backward compatibility
export type { Task, TimeEntry };
