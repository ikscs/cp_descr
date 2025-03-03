import React from 'react';

interface Section {
    title: string;
    value: string | number;
    width?: string; // Добавляем свойство width
}

interface FooterProps {
    sections: Section[];
    backgroundColor: string;
}

const FooterMulti = ({ sections, backgroundColor }: FooterProps) => (
    <footer
        style={{ backgroundColor: backgroundColor }}
        className="footer"
    >
        <p style={{ display: 'flex' }}> {/* Используем flex для расположения секций */}
            {sections.map((section, index) => (
                <React.Fragment key={index}>
                    <span style={{ width: section.width }}> {/* Применяем ширину */}
                        {section.title}: {section.value}
                    </span>
                    {/*index < sections.length - 1 && ', '*/}
                </React.Fragment>
            ))}
        </p>
    </footer>
);

export default FooterMulti;