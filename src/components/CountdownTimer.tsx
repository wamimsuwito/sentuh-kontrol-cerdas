
import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  duration: number;
  onComplete: () => void;
}

const CountdownTimer = ({ duration, onComplete }: CountdownTimerProps) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    console.log(`⏱️ Starting countdown with ${duration} seconds`);
    setRemainingTime(duration);

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1;
        console.log(`⏱️ Countdown: ${newTime} seconds remaining`);
        
        if (newTime <= 0) {
          console.log('⏱️ Countdown completed');
          clearInterval(interval);
          onComplete();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      console.log('⏱️ Cleaning up countdown timer');
      clearInterval(interval);
    };
  }, [duration, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
      : `${remainingSeconds}`;
  };

  const progressPercentage = ((duration - remainingTime) / duration) * 100;

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Timer className="w-6 h-6 text-white" />
        <span className="text-2xl font-bold text-white">
          {formatTime(remainingTime)}
        </span>
      </div>
      
      <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-2">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <p className="text-sm text-white opacity-90">
        {remainingTime > 0 ? 'Relay sedang aktif...' : 'Selesai!'}
      </p>
    </div>
  );
};

export default CountdownTimer;
