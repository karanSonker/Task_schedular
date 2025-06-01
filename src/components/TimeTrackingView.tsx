
import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskContext } from '@/context/TaskContext';

export const TimeTrackingView = () => {
  const { tasks, timeEntries, timeEntriesLoading, createTimeEntry, stopTimeEntry } = useTaskContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  // Check for active timer on mount
  useEffect(() => {
    const activeEntry = timeEntries.find(entry => entry.is_active);
    if (activeEntry) {
      setActiveEntryId(activeEntry.id);
      setSelectedTaskId(activeEntry.task_id);
      setIsRunning(true);
      
      // Calculate elapsed time
      const startTime = new Date(activeEntry.start_time).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setCurrentTime(elapsed);
    }
  }, [timeEntries]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime((time) => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!selectedTaskId) return;

    const startTime = new Date().toISOString();
    createTimeEntry({
      task_id: selectedTaskId,
      start_time: startTime,
    });

    setIsRunning(true);
    setCurrentTime(0);
  };

  const stopTimer = () => {
    if (activeEntryId) {
      stopTimeEntry({ id: activeEntryId, duration: currentTime });
    }
    setIsRunning(false);
    setCurrentTime(0);
    setActiveEntryId(null);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const getTaskTimeEntries = (taskId: string) => {
    return timeEntries.filter(entry => entry.task_id === taskId && !entry.is_active);
  };

  const getTotalTaskTime = (taskId: string) => {
    const entries = getTaskTimeEntries(taskId);
    return entries.reduce((total, entry) => total + entry.duration, 0);
  };

  const activeTasks = tasks.filter(task => task.status !== 'completed');

  if (timeEntriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Time Tracking
        </h1>
        <p className="text-gray-600 mt-1">
          Track time spent on your tasks and monitor productivity
        </p>
      </div>

      {/* Timer Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
        <div className="text-center space-y-6">
          <div className="text-6xl font-mono font-bold text-gray-900">
            {formatTime(currentTime)}
          </div>

          <div className="space-y-4">
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId} disabled={isRunning}>
              <SelectTrigger className="max-w-md mx-auto">
                <SelectValue placeholder="Select a task to track" />
              </SelectTrigger>
              <SelectContent>
                {activeTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    <div className="flex items-center gap-2">
                      <span>{task.title}</span>
                      <span className="text-sm text-gray-500">
                        ({formatTime(getTotalTaskTime(task.id))})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3 justify-center">
              {!isRunning && currentTime === 0 ? (
                <Button
                  onClick={startTimer}
                  disabled={!selectedTaskId}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 text-lg"
                >
                  <Play size={20} className="mr-2" />
                  Start Timer
                </Button>
              ) : (
                <>
                  {isRunning ? (
                    <Button
                      onClick={pauseTimer}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3"
                    >
                      <Pause size={20} className="mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      onClick={resumeTimer}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3"
                    >
                      <Play size={20} className="mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button
                    onClick={stopTimer}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3"
                  >
                    <Square size={20} className="mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Time Entries */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Time Entries</h2>
        <div className="space-y-3">
          {timeEntries
            .filter(entry => !entry.is_active)
            .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
            .slice(0, 10)
            .map((entry) => {
              const task = tasks.find(t => t.id === entry.task_id);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-white/20"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{task?.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.start_time).toLocaleDateString()} at {new Date(entry.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-mono font-semibold text-gray-700">
                    <Clock size={16} />
                    {formatTime(entry.duration)}
                  </div>
                </div>
              );
            })}
        </div>
        
        {timeEntries.filter(entry => !entry.is_active).length === 0 && (
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No time entries yet. Start tracking your first task!</p>
          </div>
        )}
      </div>
    </div>
  );
};
