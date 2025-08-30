import React, { useEffect, useState } from 'react';

const tips = [
  "Keep your emergency contact list updated.",
  "Stay in well-lit areas at night.",
  "Regularly share your location with a trusted person.",
  "Avoid using headphones while walking alone.",
  "Use voice/SOS gesture if you're in danger.",
];

const ScheduledTips = () => {
  const [currentTip, setCurrentTip] = useState('');

  useEffect(() => {
    const showRandomTip = () => {
      const tip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(tip);
    };

    showRandomTip(); // Show one immediately
    const interval = setInterval(showRandomTip, 10 * 60 * 1000); // every 10 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Scheduled Safety Tips</h1>
      <p className="text-lg text-blue-700 font-semibold">{currentTip}</p>
    </div>
  );
};

export default ScheduledTips;
