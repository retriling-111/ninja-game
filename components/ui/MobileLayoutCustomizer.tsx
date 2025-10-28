import React, { useState, useRef, useCallback } from 'react';
import { useControlsContext, DEFAULT_MOBILE_LAYOUT } from '../../contexts/ControlsContext';
import type { MobileUILayout, MobileUIGroup, MobileUIPosition } from '../../types';

interface MobileLayoutCustomizerProps {
  onClose: () => void;
}

// Visual-only representation of a control button for the customizer UI
const ControlPreviewButton: React.FC<{ label: string | React.ReactNode; className?: string; }> = ({ label, className }) => (
    <div
        className={`w-16 h-16 flex items-center justify-center bg-white/20 rounded-full text-white text-3xl font-bold select-none ${className}`}
    >
        {label}
    </div>
);

interface DraggableGroupProps {
  group: MobileUIGroup;
  layout: MobileUIPosition;
  onLayoutChange: (newPosition: MobileUIPosition) => void;
}

const DraggableGroup: React.FC<DraggableGroupProps> = ({ group, layout, onLayoutChange }) => {
    const dragRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!dragRef.current) return;
        const touch = e.touches[0];
        const parentRect = dragRef.current.parentElement!.getBoundingClientRect();
        const elRect = dragRef.current.getBoundingClientRect();

        let newTop = touch.clientY - parentRect.top - offsetRef.current.y;
        let newBottom = parentRect.height - newTop - elRect.height;
        newBottom = Math.max(0, Math.min(newBottom, parentRect.height - elRect.height));

        const newPosition: MobileUIPosition = { bottom: newBottom };

        if (layout.left !== undefined) {
            let newLeft = touch.clientX - parentRect.left - offsetRef.current.x;
            newLeft = Math.max(0, Math.min(newLeft, parentRect.width - elRect.width));
            newPosition.left = newLeft;
        } else if (layout.right !== undefined) {
            const newLeft = touch.clientX - parentRect.left - offsetRef.current.x;
            let newRight = parentRect.width - newLeft - elRect.width;
            newRight = Math.max(0, Math.min(newRight, parentRect.width - elRect.width));
            newPosition.right = newRight;
        }
        
        onLayoutChange(newPosition);
    }, [layout, onLayoutChange]);

    const handleTouchEnd = useCallback(() => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    }, [handleTouchMove]);
    
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!dragRef.current) return;
        const touch = e.touches[0];
        const rect = dragRef.current.getBoundingClientRect();
        offsetRef.current = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
    }, [handleTouchMove, handleTouchEnd]);

    const style: React.CSSProperties = {
        position: 'absolute',
        bottom: `${layout.bottom}px`,
        left: layout.left !== undefined ? `${layout.left}px` : 'auto',
        right: layout.right !== undefined ? `${layout.right}px` : 'auto',
        touchAction: 'none', // Prevent scrolling on mobile
    };
    
    return (
        <div ref={dragRef} style={style} onTouchStart={handleTouchStart} className="pointer-events-auto cursor-grab active:cursor-grabbing p-2 bg-white/10 rounded-lg">
            {group === 'movement' ? (
                 <div className="flex items-center gap-4">
                    <ControlPreviewButton label="←" />
                    <ControlPreviewButton label="→" />
                </div>
            ) : (
                <div className="flex items-end gap-3">
                    <ControlPreviewButton label="S" className="w-14 h-14" />
                    <ControlPreviewButton label="D" className="w-14 h-14" />
                    <ControlPreviewButton label="W" className="w-14 h-14" />
                    <ControlPreviewButton label="A" />
                    <ControlPreviewButton label="↑" className="w-20 h-20 text-4xl" />
                </div>
            )}
        </div>
    );
};

const MobileLayoutCustomizer: React.FC<MobileLayoutCustomizerProps> = ({ onClose }) => {
    const { mobileLayout, setMobileLayout, resetMobileLayout } = useControlsContext();
    const [editingLayout, setEditingLayout] = useState<MobileUILayout>(mobileLayout);

    const handleLayoutChange = (group: MobileUIGroup, newPosition: MobileUIPosition) => {
        setEditingLayout(prev => ({
            ...prev,
            [group]: newPosition
        }));
    };
    
    const handleSave = () => {
        setMobileLayout(editingLayout);
        onClose();
    };

    const handleReset = () => {
        setEditingLayout(DEFAULT_MOBILE_LAYOUT);
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
            <div className="text-center text-white mb-4">
                <h2 className="text-3xl font-bold text-red-500 blood-text-shadow">Customize Mobile UI</h2>
                <p className="text-lg">Drag the controls to your desired position.</p>
            </div>
            
            <div className="relative w-full h-[60%] border-4 border-dashed border-gray-600 rounded-lg overflow-hidden">
                <DraggableGroup group="movement" layout={editingLayout.movement} onLayoutChange={(pos) => handleLayoutChange('movement', pos)} />
                <DraggableGroup group="actions" layout={editingLayout.actions} onLayoutChange={(pos) => handleLayoutChange('actions', pos)} />
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={handleSave} className="px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold text-lg rounded-lg">Save & Close</button>
                <button onClick={handleReset} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg rounded-lg">Reset</button>
                <button onClick={onClose} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg rounded-lg">Cancel</button>
            </div>
        </div>
    );
};

export default MobileLayoutCustomizer;
