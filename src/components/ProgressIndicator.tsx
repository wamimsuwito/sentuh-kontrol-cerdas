
interface ProgressIndicatorProps {
  progress: number;
}

const ProgressIndicator = ({ progress }: ProgressIndicatorProps) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressIndicator;
