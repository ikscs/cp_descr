declare module 'react-split-pane' {
    import * as React from 'react';

    interface SplitPaneProps {
        split?: 'vertical' | 'horizontal';
        minSize?: number;
        defaultSize?: number;
        onChange?: (newSize: number) => void;
        onDragStarted?: () => void;
        onDragFinished?: () => void;
        className?: string;
        style?: React.CSSProperties;
        paneStyle?: React.CSSProperties;
        pane1Style?: React.CSSProperties;
        pane2Style?: React.CSSProperties;
        resizerStyle?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export default class SplitPane extends React.Component<SplitPaneProps, any> {}
}