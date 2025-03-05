import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled??false}
        />
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
