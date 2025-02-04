import React, { useState } from 'react';
import MainWindow from './MainWindow';
import AltWindow from './AltWindow';
import { UpsertProvider } from './views/UpsertContext';

const GrandContainer: React.FC = () => {

    const [activeWindow, setActiveWindow] = useState('MainWindow') 
    console.log(setActiveWindow)

    return (
        <div>
            <div style={{ padding: '10px' }}>

                {activeWindow === 'MainWindow' && 
                    <div className="App" style={{position: 'absolute', top: 0, margin:10}}>
                        <UpsertProvider>
                            <MainWindow/>
                        </UpsertProvider>
                    </div>}

                {activeWindow === 'AltWindow' && 
                    <div className="App" style={{position: 'absolute', top: 0, margin:10}}>
                        <AltWindow/>
                    </div>}
            </div>
        </div>
    );
};

export default GrandContainer;