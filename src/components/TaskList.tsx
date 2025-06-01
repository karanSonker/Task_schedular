
import { useState } from 'react';
import { Clock, Edit2, Trash2, CheckCircle, Circle, AlertCircle, Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTaskContext } from '@/context/TaskContext';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

export const TaskList = () => {
  const { tasks, tasksLoading, updateTask, deleteTask } = useTaskContext();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Group tasks by priority
  const groupedTasks = {
    high: filteredTasks.filter(task => task.priority === 'high'),
    medium: filteredTasks.filter(task => task.priority === 'medium'),
    low: filteredTasks.filter(task => task.priority === 'low'),
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'in-progress':
        return <AlertCircle className="text-orange-500" size={20} />;
      case 'todo':
        return <Circle className="text-gray-400" size={20} />;
    }
  };

  const toggleTaskStatus = (task: Task) => {
    let newStatus: Task['status'];
    if (task.status === 'todo') {
      newStatus = 'in-progress';
    } else if (task.status === 'in-progress') {
      newStatus = 'completed';
    } else {
      newStatus = 'todo';
    }

    updateTask({
      id: task.id,
      updates: {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const renderTaskGroup = (priority: Task['priority'], tasks: Task[]) => {
    if (tasks.length === 0) return null;

    const priorityConfig = {
      high: {
        label: 'High Priority',
        icon: Flag,
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-50 to-red-100',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        badgeStyle: 'bg-red-500 text-white'
      },
      medium: {
        label: 'Medium Priority',
        icon: AlertCircle,
        gradient: 'from-yellow-500 to-orange-500',
        bgGradient: 'from-yellow-50 to-orange-100',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600',
        badgeStyle: 'bg-yellow-500 text-white'
      },
      low: {
        label: 'Low Priority',
        icon: Circle,
        gradient: 'from-green-500 to-emerald-600',
        bgGradient: 'from-green-50 to-emerald-100',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        badgeStyle: 'bg-green-500 text-white'
      }
    };

    const config = priorityConfig[priority];
    const IconComponent = config.icon;

    return (
      <div key={priority} className={cn(
        "relative overflow-hidden rounded-2xl border-2 p-6 mb-8 backdrop-blur-sm",
        "bg-gradient-to-br", config.bgGradient,
        config.borderColor,
        "shadow-lg hover:shadow-xl transition-all duration-300"
      )}>
        {/* Priority Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-md",
              "bg-gradient-to-r", config.gradient
            )}>
              <IconComponent size={20} className="text-white" />
            </div>
            <div>
              <h3 className={cn("text-xl font-bold", config.textColor)}>
                {config.label}
              </h3>
              <p className="text-sm text-gray-600">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
          <Badge className={cn("px-3 py-1 font-semibold shadow-sm", config.badgeStyle)}>
            {tasks.length}
          </Badge>
        </div>

        {/* Tasks Container */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "group relative bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-white/50",
                "shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
                "hover:bg-white/95",
                task.status === 'completed' && "opacity-75"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-1 hover:scale-110 transition-transform duration-200 p-1 rounded-full hover:bg-gray-100"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={cn(
                      "text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-800",
                      task.status === 'completed' && "line-through text-gray-500"
                    )}>
                      {task.title}
                    </h4>
                    <p className="text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      
                      {task.estimated_time && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                          <Clock size={14} />
                          <span>{task.estimated_time}m</span>
                        </div>
                      )}
                      
                      <span className="text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-100 hover:text-blue-600 hover:scale-105 transition-all duration-200 p-2"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="hover:bg-red-100 hover:text-red-600 hover:scale-105 transition-all duration-200 p-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Filter Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {['all', 'todo', 'in-progress', 'completed'].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            onClick={() => setFilter(filterOption as any)}
            className={cn(
              "transition-all duration-300 px-6 py-2 rounded-xl font-medium",
              filter === filterOption
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl scale-105"
                : "hover:bg-gray-100 hover:scale-105 border-2"
            )}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1).replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Task Groups by Priority */}
      <div className="space-y-6">
        {renderTaskGroup('high', groupedTasks.high)}
        {renderTaskGroup('medium', groupedTasks.medium)}
        {renderTaskGroup('low', groupedTasks.low)}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Circle size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No tasks found</h3>
            <p className="text-gray-500 text-lg">
              {filter === 'all' 
                ? "Ready to boost your productivity? Create your first task!" 
                : `No ${filter.replace('-', ' ')} tasks at the moment.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
