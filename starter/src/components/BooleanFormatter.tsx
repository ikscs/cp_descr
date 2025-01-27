import React from 'react';

interface BooleanFormatterProps {
    value: boolean;
    // description: string;
}

const BooleanFormatter: React.FC<BooleanFormatterProps> = ({ value, /*description*/ }) => {
    return (
        <div>
            <span>{value ? '✔️' : '❌'}</span>
            {/* <span>{description}</span> */}
        </div>
    );
};

export default BooleanFormatter;