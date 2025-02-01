// filepath: /D:/dvl/ikscs/react/vp-descr/best/src/components/split exam1.tsx
import React from 'react';
import SplitPane from 'react-split-pane';

const SplitExam: React.FC = () => {
  return (
    <SplitPane split="vertical" minSize={50} defaultSize={200}>
      <div>Left Pane</div>
      <div>Right Pane</div>
    </SplitPane>
  );
};

export default SplitExam;