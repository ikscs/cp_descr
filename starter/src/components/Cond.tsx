import React, { HTMLAttributes } from 'react';

interface CondProps extends HTMLAttributes<HTMLDivElement> {
    condition: boolean;
}

const Cond: React.FC<CondProps> = ({ condition, children, ...rest }) => {
    return condition ? <div {...rest}>{children}</div> : null;
};

export default Cond;