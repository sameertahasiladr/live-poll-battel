import React from 'react';
import { Check } from 'lucide-react';

interface VoteOptionsProps {
  options: string[];
  onVote: (option: string) => void;
  hasVoted: boolean;
  userChoice: string | null;
}

const VoteOptions: React.FC<VoteOptionsProps> = ({ 
  options, 
  onVote, 
  hasVoted, 
  userChoice 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onVote(option)}
          disabled={hasVoted}
          className={`
            p-4 rounded-lg border-2 transition-all duration-200
            ${hasVoted && userChoice === option 
              ? 'border-blue-600 bg-blue-50' 
              : hasVoted 
                ? 'border-gray-200 bg-gray-50 opacity-70' 
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }
          `}
        >
          <div className="flex items-center justify-center">
            {hasVoted && userChoice === option && (
              <Check className="text-blue-600 mr-2" size={18} />
            )}
            <span className={`font-medium ${hasVoted && userChoice === option ? 'text-blue-800' : 'text-gray-800'}`}>
              {option}
            </span>
          </div>
          
          {hasVoted && userChoice === option && (
            <div className="mt-2 text-xs text-blue-700">
              Your choice
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default VoteOptions;