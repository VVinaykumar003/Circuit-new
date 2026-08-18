import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface Props {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<Props> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-base-100 rounded-2xl">
      <FaExclamationTriangle className="text-error text-4xl mb-4" />
      <h2 className="text-xl font-semibold text-base-content mb-2">An Error Occurred</h2>
      <p className="text-base-content/70 mb-6 max-w-sm">{message}</p>
      <button className="btn btn-primary" onClick={onRetry}>
        <FaRedo /> Retry
      </button>
    </div>
  );
};

export default ErrorState;