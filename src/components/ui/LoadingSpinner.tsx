interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'blue' | 'gray';
  text?: string;
}

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'purple', 
  text = 'Loading...' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    purple: 'border-purple-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div 
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      ></div>
      {text && (
        <p className="text-gray-600 text-sm">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;