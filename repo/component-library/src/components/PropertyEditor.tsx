import React, { useState } from 'react';

export interface Property {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'multiselect';
  value: any;
  options?: { key: string; value: string }[];
}

interface PropertyEditorProps {
  properties: Property[];
  onChange: (updatedProperties: Property[]) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ properties, onChange }) => {
  const [editedProperties, setEditedProperties] = useState(properties);

  const handleChange = (index: number, newValue: any) => {
    const updatedProperties = [...editedProperties];
    updatedProperties[index].value = newValue;
    setEditedProperties(updatedProperties);
    onChange(updatedProperties);
  };

  const handleMultiSelectChange = (index: number, optionValue: string) => {
    const updatedProperties = [...editedProperties];
    const selectedOptions = updatedProperties[index].value as string[];
    if (selectedOptions.includes(optionValue)) {
      updatedProperties[index].value = selectedOptions.filter(value => value !== optionValue);
    } else {
      updatedProperties[index].value = [...selectedOptions, optionValue];
    }
    setEditedProperties(updatedProperties);
    onChange(updatedProperties);
  };

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid black' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', verticalAlign: 'top', border: '1px solid black' }}>Name</th>
          <th style={{ textAlign: 'left', verticalAlign: 'top', border: '1px solid black' }}>Type</th>
          <th style={{ textAlign: 'left', verticalAlign: 'top', border: '1px solid black' }}>Value</th>
        </tr>
      </thead>
      <tbody>
        {editedProperties.map((property, index) => (
          <tr key={index}>
            <td style={{ verticalAlign: 'top', border: '1px solid black' }}>{property.name}</td>
            <td style={{ verticalAlign: 'top', border: '1px solid black' }}>{property.type}</td>
            <td style={{ verticalAlign: 'top', border: '1px solid black' }}>
              {property.type === 'number' && (
                <input
                  type="number"
                  value={property.value}
                  onChange={(e) => handleChange(index, parseFloat(e.target.value))}
                  style={{ border: 'none' }}
                />
              )}
              {property.type === 'string' && (
                <input
                  type="text"
                  value={property.value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  style={{ border: 'none' }}
                />
              )}
              {property.type === 'boolean' && (
                <input
                  type="checkbox"
                  checked={property.value}
                  onChange={(e) => handleChange(index, e.target.checked)}
                  style={{ border: '1px solid black' }}
                />
              )}
              {property.type === 'select' && (
                <select
                  value={property.value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  style={{ width: '100%', border: '1px solid black' }}
                >
                  {property.options?.map((option) => (
                    <option key={option.key} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              )}
              {property.type === 'multiselect' && (
                <div>
                  {property.options?.map((option) => (
                    <div key={option.key}>
                      <label>
                        <input
                          type="checkbox"
                          checked={(property.value as string[]).includes(option.value)}
                          onChange={() => handleMultiSelectChange(index, option.value)}
                          style={{ border: '1px solid black' }}
                        />
                        {option.value}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PropertyEditor;
