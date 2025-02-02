import React, { useState } from 'react';
import PropertyEditor, { Property } from '../components/PropertyEditor';

const PropertyEditorView: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([
    { name: 'Age', type: 'number', value: 25 },
    { name: 'Name', type: 'string', value: 'John Doe' },
    { name: 'Is Active', type: 'boolean', value: true },
    {
      name: 'Favorite Color',
      type: 'select',
      value: 'blue',
      options: [
        { key: 'red', value: 'Red' },
        { key: 'blue', value: 'Blue' },
        { key: 'green', value: 'Green' },
      ],
    },
    {
      name: 'Hobbies',
      type: 'multiselect',
      value: ['reading', 'traveling'],
      options: [
        { key: 'reading', value: 'Reading' },
        { key: 'traveling', value: 'Traveling' },
        { key: 'cooking', value: 'Cooking' },
        { key: 'sports', value: 'Sports' },
      ],
    },
    { name: 'Name', type: 'string', value: 'Анна Мария' },
    { name: 'Name', type: 'string', value: 'Петя Большой' },
  ]);

  const handlePropertiesChange = (updatedProperties: Property[]) => {
    setProperties(updatedProperties);
  };

  return (
    <div>
      <h1>Property Editor</h1>
      <PropertyEditor properties={properties} onChange={handlePropertiesChange} />
    </div>
  );
};

export default PropertyEditorView;
