import React from 'react';

interface AboutScreenProps {
  onBack: () => void;
}

const ControlItem: React.FC<{ keyName: string; action: string }> = ({ keyName, action }) => (
  <p><span className="font-bold text-gray-200">{keyName}</span> - {action}</p>
);

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-2xl w-full">
      <h1 className="text-5xl md:text-6xl font-bold text-red-600 blood-text-shadow">
        About Crimson Shinobi
      </h1>
      
      <p className="mt-6 text-lg text-gray-300">
        Embark on a perilous journey as the Crimson Shinobi. Master the shadows, overcome deadly traps, and vanquish your foes with silent precision. Your path is one of blood and darkness. Prove your skill and become a legend.
      </p>

      <div className="mt-8 text-gray-400 p-4 border border-gray-700 rounded-md bg-black/30 w-full text-left flex flex-col md:flex-row gap-8">
        <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Desktop Controls:</h2>
            <ControlItem keyName="Left/Right Arrows" action="Move" />
            <ControlItem keyName="Up Arrow" action="Jump" />
            <ControlItem keyName="Space" action="Double Jump" />
            <ControlItem keyName="A" action="Attack" />
            <ControlItem keyName="D" action="Dash" />
            <ControlItem keyName="W" action="Teleport" />
            <ControlItem keyName="S" action="Shadow Clone" />
            <ControlItem keyName="P" action="Pause" />
        </div>
        <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Mobile Controls:</h2>
            <p>Coming soon! A touch-based control scheme is in development for our shinobi on the go.</p>
        </div>
      </div>

      <div className="mt-8 text-center w-full">
         <h2 className="text-xl font-bold text-white mb-2">Support</h2>
         <p>For questions, feedback, or bug reports, please contact our support team at:</p>
         <a href="mailto:retriling123@gmail.com" className="text-red-500 hover:text-red-400">retriling123@gmail.com</a>
      </div>

      <button
        onClick={onBack}
        className="mt-12 px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default AboutScreen;