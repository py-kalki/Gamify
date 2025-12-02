export { };

declare global {
    interface Window {
        electron: {
            getActivity: () => Promise<any>;
            resizeWidget: (width: number, height: number) => void;
            setMode: (mode: 'dashboard' | 'widget') => void;
            windowControl: (action: 'minimize' | 'close' | 'quit') => void;
            resizeWindow: (width: number, height: number) => void;
            onForceWidget: (callback: () => void) => void;
            removeForceWidgetListener: (callback: () => void) => void;
        };
    }
}
