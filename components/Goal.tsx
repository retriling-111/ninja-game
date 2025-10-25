
import React from 'react';
import type { GameObject } from '../../types';

interface GoalProps {
  goal: GameObject;
}

const Goal: React.FC<GoalProps> = ({ goal }) => {
  return (
    <div
      style={{
        left: goal.x,
        top: goal.y,
        width: goal.width,
        height: goal.height,
      }}
      className="absolute flex flex-col items-center justify-between"
    >
      <div
        className="h-2 bg-red-700"
        style={{ width: goal.width * 1.2, transform: 'translateX(-10%)' }}
      ></div>
      <div className="w-full h-full flex justify-between">
        <div className="w-2 h-full bg-red-700"></div>
        <div className="w-2 h-full bg-red-700"></div>
      </div>
    </div>
  );
};

export default Goal;
