import React from 'react';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    name: string;
    label?: string;
    labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
    onValueChange: (name: string, value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ name, label, onValueChange, labelProps, ...props }) => {
    
    const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const { name, value } = e.target;
        onValueChange(name, value);
    };    
      
    return (
        <div>
            {label && <label htmlFor={name} {...labelProps}>{label}</label>}
            <input type="text" name={name} onChange={onInputChange} {...props} />
        </div>
    );
};

export default TextInput;