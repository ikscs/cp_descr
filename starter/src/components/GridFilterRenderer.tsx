import Combo from './combo';
import Checkbox from './checkbox';

interface GridFilterRendererProps {
    column: any;
    filters: { [key: string]: string };
    setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
    getEditable: (key: string) => boolean;
    // isCellEditable: boolean;
    // sp: ISelectedPosition;
}

// interface ISelectedPosition {
//     rowIdx: number;
//     colName: string;
// }

const GridFilterRenderer: React.FC<GridFilterRendererProps> = ({ column, filters, setFilters, getEditable, /*isCellEditable, sp*/ }) => {
    // console.log('GridFilterRenderer sp', sp);
    const handleFilterChange = (value: string | boolean ) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column.key]: value
        }));
        console.log(`Filter changed for column: ${column.name} to value: ${value}`);
    }

    const handleFilterInputKeyDown = (event: React.KeyboardEvent) => {
        event.stopPropagation();
        console.log(`Filter input keydown for column: ${column.name} event.key: ${event.key}`);
        // Prevent default behavior to ensure keystrokes go to the filter input
        // event.preventDefault();
    };

    const handleFilterInputClick = (event: React.MouseEvent) => {
        console.log(`Filter input clicked for column: ${column.name}`);
        event.stopPropagation();
        // if (isCellEditable) {
        //     if (document.activeElement) {
        //         (document.activeElement as HTMLElement).blur();
        //     }            
        // }
        if (document.activeElement && getEditable(column.name)) {
            (document.activeElement as HTMLElement).blur();
        }
    };
    
    // const handleFilterInputFocus = () => {
    //     console.log(`Filter input focused for column: ${column.name}`);
    //     getEditable(column.name)
    //     if (getEditable(column.name)) {
    //     // if (isCellEditable) {
    //         if (document.activeElement) {
    //             (document.activeElement as HTMLElement).blur();
    //         }            
    //     }
    // };

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
                    onClick={handleFilterInputClick}
                    // onFocus={handleFilterInputFocus}
                    onKeyDown={handleFilterInputKeyDown}
                    className='filter-input'
                />
            </>
            );        
        default:
            return null;
    }
};

export default GridFilterRenderer
