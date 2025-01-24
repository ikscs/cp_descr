import React, { useState, useEffect, useRef } from 'react';

interface Option {
    label: string;
    onSelect?: () => void;
}

interface ComboProps {
    options: Option[];
    caption: string;
    width?: string;
}

const ComboMenu: React.FC<ComboProps> = ({ options, caption, width }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (option: Option) => {
        if (option.onSelect) {
            option.onSelect();
        }
        setIsOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="dropdown" style={{ width, position: 'relative' }} ref={dropdownRef}>
            <button onClick={handleToggle} className="dropdown-toggle">
                {caption}
            </button>
            {isOpen && (
                <ul className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1, listStyleType: 'none', padding: 0, margin: 0, backgroundColor: '#e0e0e0', border: '1px solid #ccc', borderRadius: '4px' }}>
                    {options.map((option, index) => (
                        <li key={index} onClick={() => handleSelect(option)} className="dropdown-item" style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ComboMenu;