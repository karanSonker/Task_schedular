
import { useState } from 'react';
import { TaskProvider } from '@/context/TaskContext';
import { Sidebar } from '@/components/Sidebar';
import { TaskView } from '@/components/TaskView';
import { TimeTrackingView } from '@/components/TimeTrackingView';
import { StatisticsView } from '@/components/StatisticsView';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  const [activeView, setActiveView] = useState('tasks');

  const renderActiveView = () => {
    switch (activeView) {
      case 'tasks':
        return <TaskView />;
      case 'tracking':
        return <TimeTrackingView />;
      case 'statistics':
        return <StatisticsView />;
      default:
        return <TaskView />;
    }
  };

  return (
    <ErrorBoundary>
      <TaskProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 transition-all duration-300">
              <div className="p-6">
                <div className="animate-fade-in">
                  {renderActiveView()}
                </div>
              </div>
            </main>
          </div>
        </div>
      </TaskProvider>
    </ErrorBoundary>
  );
};

export default Index;
