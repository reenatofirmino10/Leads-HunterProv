
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6828]"></div>
        <p className="text-[#6B7280] text-sm">Analisando com IA...</p>
    </div>
  );
};

export default Spinner;
