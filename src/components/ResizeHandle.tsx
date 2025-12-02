import { useEffect, useRef } from 'react';

type ResizeDirection = 'right' | 'bottom' | 'corner';

export function ResizeHandle() {
    const isDragging = useRef(false);
    const direction = useRef<ResizeDirection | null>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ width: 0, height: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !direction.current) return;

            const deltaX = e.screenX - startPos.current.x;
            const deltaY = e.screenY - startPos.current.y;

            let newWidth = startSize.current.width;
            let newHeight = startSize.current.height;

            if (direction.current === 'right' || direction.current === 'corner') {
                newWidth = Math.max(200, startSize.current.width + deltaX);
            }
            if (direction.current === 'bottom' || direction.current === 'corner') {
                newHeight = Math.max(100, startSize.current.height + deltaY);
            }

            // console.log('Resizing:', { deltaX, deltaY, newWidth, newHeight });

            if (window.electron && window.electron.resizeWindow) {
                window.electron.resizeWindow(newWidth, newHeight);
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            direction.current = null;
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent, dir: ResizeDirection) => {
        e.preventDefault(); // Prevent text selection
        isDragging.current = true;
        direction.current = dir;
        startPos.current = { x: e.screenX, y: e.screenY };
        startSize.current = { width: window.outerWidth, height: window.outerHeight };

        const cursorMap = {
            right: 'ew-resize',
            bottom: 'ns-resize',
            corner: 'nwse-resize'
        };
        document.body.style.cursor = cursorMap[dir];
    };

    return (
        <>
            {/* Right Handle */}
            <div
                onMouseDown={(e) => handleMouseDown(e, 'right')}
                className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize z-[9999] hover:bg-indigo-500/50 transition-colors"
            />

            {/* Bottom Handle */}
            <div
                onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-[9999] hover:bg-indigo-500/50 transition-colors"
            />

            {/* Corner Handle */}
            <div
                onMouseDown={(e) => handleMouseDown(e, 'corner')}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-[9999] flex items-end justify-end p-1 group"
            >
                <div className="w-2 h-2 border-r-2 border-b-2 border-white/20 group-hover:border-white/50 transition-colors rounded-br-sm" />
            </div>
        </>
    );
}

