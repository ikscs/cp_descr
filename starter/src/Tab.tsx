import React from 'react';

interface TabProps {
    label: string;
    onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, onClick }) => {
    return (
        <div onClick={onClick} style={{ cursor: 'pointer', padding: '10px', borderBottom: '2px solid transparent' }}>
            {label}
        </div>
    );
};

export default Tab;