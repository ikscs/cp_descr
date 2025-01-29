import React, { /*useContext*/ } from 'react';
import Combo from './combo';
import Checkbox from './checkbox';

interface GridFilterRendererProps {
    column: any;
    filters: { [key: string]: string };
    setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

const GridFilterRenderer: React.FC<GridFilterRendererProps> = ({ column, filters, setFilters }) => {

    const handleFilterChange = (value: string | boolean ) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column.key]: value
        }));
        console.log(`Filter changed for column: ${column.name} to value: ${value}`);
    }

    const handleFilterClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        console.log(`Filter input clicked for column: ${column.name}`);
    };
    
    switch (column.filterType) {
        case 'combobox':
            return (
            <><div>{column.name}</div>
                <Combo
                    placeholder={''}
                    options={column.filterOptions}
                    onChange={(choice) => handleFilterChange(choice.value)}
                />
            </>
            );
        case 'checkbox':
            return (
            <><div>{column.name}</div>
                <Checkbox
                    label=''
                    defaultValue={false}
                    onChange={handleFilterChange}
                />
            </>
            );
        case 'textbox':
            return (
                <>
                    <div style={{ width: '100px' }}>{column.name}</div>
                    <input
                        type="text"
                        style={{ width: '100%' }}
                        value={filters[column.key]}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        onClick={handleFilterClick}
                    />
                </>
            );        
        default:
            return null;
    }
};

export default GridFilterRenderer
