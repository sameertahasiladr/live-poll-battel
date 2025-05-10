import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  timeRemaining: number;
  isActive: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeRemaining, isActive }) => {
  const progressPercentage = useMemo(() => {
    return Math.max(0, Math.min(100, (timeRemaining / 60) * 100));
  }, [timeRemaining]);
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);
  const getColor = useMemo(() => {
    if (timeRemaining > 30) return 'bg-green-500';
    if (timeRemaining > 10) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [timeRemaining]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <Clock size={16} className="mr-1" />
          <span className="text-sm font-medium">
            {isActive ? 'Time Remaining:' : 'Voting ended'}
          </span>
        </div>
        <span className="text-sm font-bold">{formattedTime}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${getColor}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CountdownTimer;