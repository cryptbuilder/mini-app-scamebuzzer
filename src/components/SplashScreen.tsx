import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 500); // Wait for fade out animation
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-gray-900 flex flex-col items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative">
        <img 
          src="/ScamBuzzer.png" 
          alt="ScamBuzzer Logo" 
          className="w-32 h-32 animate-bounce"
        />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <h1 className="text-3xl font-bold text-green-400 mt-6 animate-fade-in">
        ScamBuzzer
      </h1>
      <p className="text-gray-400 mt-2 animate-fade-in-delay">
        Your Web3 Security Guardian
      </p>
    </div>
  );
}; 