import React from 'react';

interface AboutScreenProps {
  onBack: () => void;
}

const ControlItem: React.FC<{ keyName: string; action: string }> = ({ keyName, action }) => (
  <li><span className="font-semibold text-gray-200">{keyName}:</span> {action}</li>
);

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-2xl w-full p-4">
      <div className="bg-black/50 ios-backdrop-blur p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-red-600 blood-text-shadow">
          About
        </h1>
        
        <p className="mt-6 text-lg text-gray-300">
          Embark on a perilous journey as the Crimson Shinobi. Master the shadows, overcome deadly traps, and vanquish your foes with silent precision. Your path is one of blood and darkness. Prove your skill and become a legend.
        </p>

        <div className="mt-8 text-gray-400 text-left flex flex-col md:flex-row gap-8">
          <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Controls:</h2>
              <ul className="space-y-1 list-inside">
                <ControlItem keyName="← / →" action="Move" />
                <ControlItem keyName="↑" action="Jump" />
                <ControlItem keyName="Space" action="Double Jump" />
                <ControlItem keyName="A" action="Attack" />
                <ControlItem keyName="D" action="Dash" />
                <ControlItem keyName="S" action="Shield" />
                <ControlItem keyName="P / Esc" action="Pause" />
              </ul>
          </div>
        </div>

        <div className="mt-8 text-center w-full">
           <h2 className="text-xl font-bold text-white mb-2">Support</h2>
           <p>For feedback or bug reports, contact:</p>
           <a href="mailto:retriling123@gmail.com" className="text-red-500 hover:text-red-400">retriling122@gmail.com</a>
        </div>

        <button
          onClick={onBack}
          className="mt-12 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default AboutScreen;