import { useEffect, useRef } from 'react';

export function ResizeHandle() {
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ width: 0, height: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;

            const deltaX = e.screenX - startPos.current.x;
            const deltaY = e.screenY - startPos.current.y;

            const newWidth = Math.max(400, startSize.current.width + deltaX);
            const newHeight = Math.max(300, startSize.current.height + deltaY);

            if (window.electron && window.electron.resizeWindow) {
                window.electron.resizeWindow(newWidth, newHeight);
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startPos.current = { x: e.screenX, y: e.screenY };
        startSize.current = { width: window.outerWidth, height: window.outerHeight };
        document.body.style.cursor = 'nwse-resize';
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-end justify-end p-1 group"
        >
            <div className="w-2 h-2 border-r-2 border-b-2 border-white/20 group-hover:border-white/50 transition-colors rounded-br-sm" />
        </div>
    );
}
