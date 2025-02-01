import './styles/SplitPane.css';
import SplitPane from 'react-split-pane';
// yarn add react-split-pane@0.1.92

function SplitExam() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '50px', backgroundColor: '#ccc', padding: '10px', width: '100%', display: 'flex' }}>
        <button>Left Button</button>
        <button style={{ marginLeft: 'auto' }}>Right Button</button>
      </div>
      <div style={{ flex: 1, display: 'flex', width: '100%' }}>
        <SplitPane split="vertical" minSize={50} defaultSize={200}>
          <div style={{ padding: '10px', backgroundColor: '#f0f0f0', height: 'calc(100vh - 100px)' }}>Left Side Area</div>
          <SplitPane split="vertical" minSize={50} defaultSize="calc(100% - 400px)">
            <div style={{ padding: '10px', backgroundColor: '#e0e0e0', height: 'calc(100vh - 100px)' }}>Central Area</div>
            <div style={{ width: '400px', padding: '10px', backgroundColor: '#d0d0d0', height: 'calc(100vh - 100px)', flexShrink: 0 }}>Right Side Area</div>
          </SplitPane>
        </SplitPane>
      </div>
      <div style={{ height: '50px', backgroundColor: '#ccc', padding: '10px', width: '100%' }}>
        Footer
      </div>
    </div>
  );
}

export default SplitExam;