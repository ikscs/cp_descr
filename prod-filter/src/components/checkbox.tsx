import React, { useState } from 'react';

interface CheckboxProps {
  label: string;
  defaultValue: boolean;
  onChange: (value: boolean) => void
}

const Checkbox: React.FC<CheckboxProps> = ({ label, defaultValue, onChange }) => {
  const [checked, setChecked] = useState<boolean>(defaultValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    onChange(event.target.checked)
  };
  return (
    <div style={{marginTop: 8}}>
      <label>
        <input 
          type="checkbox"
          checked={checked}
          onChange={handleChange}
        />
        {label}
      </label>
    </div>
  )
}

export default Checkbox

/*
Certainly! Here’s a concise example of how you can use a checkbox input in a React component with TypeScript:

In this example:

We define a CheckboxProps interface to type the props.
We use the useState hook to manage the checkbox state.
The handleChange function updates the state when the checkbox is toggled.
The checked attribute of the input element is bound to the state.

This should give you a good starting point for using checkboxes 
in a React component with TypeScript. If you have any specific 
requirements or need further customization, feel free to let me know!
*/