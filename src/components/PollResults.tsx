import React, { useMemo } from 'react';
import { BarChart } from 'lucide-react';

interface PollResultsProps {
  votes: Record<string, number>;
  options: string[];
  userChoice: string | null;
}

const PollResults: React.FC<PollResultsProps> = ({ votes, options, userChoice }) => {
  const totalVotes = useMemo(() => {
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  }, [votes]);
  const getPercentage = (option: string): number => {
    if (totalVotes === 0) return 0;
    return Math.round((votes[option] / totalVotes) * 100);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center mb-2">
        <BarChart size={16} className="mr-1" />
        <h3 className="font-medium">Results</h3>
        <span className="ml-2 text-sm text-gray-500">
          ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
        </span>
      </div>
      
      <div className="space-y-3">
        {options.map((option) => {
          const percentage = getPercentage(option);
          const isUserChoice = option === userChoice;
          
          return (
            <div key={option} className="w-full">
              <div className="flex justify-between mb-1">
                <span className={`text-sm font-medium ${isUserChoice ? 'text-blue-600' : ''}`}>
                  {option} {isUserChoice && '(Your choice)'}
                </span>
                <span className="text-sm font-medium">{percentage}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${
                    isUserChoice ? 'bg-blue-600' : 'bg-purple-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {votes[option]} {votes[option] === 1 ? 'vote' : 'votes'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollResults;