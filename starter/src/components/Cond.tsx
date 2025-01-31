import React, { HTMLAttributes } from 'react';

interface CondProps extends HTMLAttributes<HTMLDivElement> {
    condition: boolean;
}

const Cond: React.FC<CondProps> = ({ condition, ...rest }) => {
    return condition ? <div {...rest} ></div> : null;
};

export default Cond;