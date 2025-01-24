import React, { useState } from 'react';
import Tab from './Tab';
import MainWindow from './MainWindow';

const TabContainer: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ['Tab 1', 'Tab 2'];

    const handleTabClick = (index: number) => {
        setActiveTab(index);
    };

    return (
        <div>
            <div style={{ display: 'flex' }}>
                {tabs.map((tab, index) => (
                    <Tab key={index} label={tab} onClick={() => handleTabClick(index)} />
                ))}
            </div>
            <div style={{ padding: '10px' }}>
                {activeTab === 0 && 
                    <div className="App" style={{position: 'absolute', top: 0, margin:10}}>
                        <MainWindow/>
                    </div>}
                {activeTab === 1 && <div>Content for Tab 2</div>}
            </div>
        </div>
    );
};

export default TabContainer;