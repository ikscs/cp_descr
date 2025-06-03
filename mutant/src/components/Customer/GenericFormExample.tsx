import { useState } from 'react';
import { GenericForm } from '../generic/GenericForm';
import { Box, Tabs, Tab } from '@mui/material';

// Имитация API запроса для загрузки категорий
const loadCategories = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
        { value: 'electronics', label: 'Електроніка' },
        { value: 'books', label: 'Книги' },
        { value: 'clothing', label: 'Одяг' },
    ];
};

// Имитация API запроса для загрузки подкатегорий
const loadSubcategories = async (categoryId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const subcategories = {
        electronics: [
            { value: 'phones', label: 'Телефони' },
            { value: 'laptops', label: 'Ноутбуки' },
        ],
        books: [
            { value: 'fiction', label: 'Художня література' },
            { value: 'science', label: 'Наукова література' },
        ],
        clothing: [
            { value: 'shirts', label: 'Сорочки' },
            { value: 'pants', label: 'Штани' },
        ],
    };
    return subcategories[categoryId as keyof typeof subcategories] || [];
};

type LayoutType = 'stack' | 'grid' | 'inline' | 'columns';

interface LayoutOption {
    type: LayoutType;
    label: string;
    config?: {
        type: LayoutType;
        columns?: number;
        fieldLayouts?: Record<string, {
            colSpan?: number;
            rowSpan?: number;
            width?: string | number;
        }>;
    };
}

export const GenericFormExample = () => {
    const [selectedLayout, setSelectedLayout] = useState(0);

    const fields = [
        {
            type: 'text' as const,
            name: 'title',
            label: 'Назва',
            required: true,
        },
        {
            type: 'text' as const,
            name: 'description',
            label: 'Опис',
            multiline: true,
            rows: 4,
        },
        {
            type: 'number' as const,
            name: 'price',
            label: 'Ціна',
            required: true,
            min: 0,
            max: 1000000,
        },
        {
            type: 'select' as const,
            name: 'currency',
            label: 'Валюта',
            required: true,
            options: [
                { value: 'UAH', label: 'Гривня' },
                { value: 'USD', label: 'Долар США' },
                { value: 'EUR', label: 'Євро' },
            ],
        },
        {
            type: 'dynamic-select' as const,
            name: 'category',
            label: 'Категорія',
            required: true,
            loadOptions: loadCategories,
        },
        {
            type: 'dynamic-select' as const,
            name: 'subcategory',
            label: 'Підкатегорія',
            required: true,
            loadOptions: loadSubcategories,
            dependsOn: 'category',
        },
        {
            type: 'switch' as const,
            name: 'isAvailable',
            label: 'Є в наявності',
            defaultValue: true,
        },
    ];

    const layouts: LayoutOption[] = [
        {
            type: 'stack',
            label: 'Стандартний',
        },
        {
            type: 'grid',
            label: 'Сітка',
            config: {
                type: 'grid',
                columns: 12,
                fieldLayouts: {
                    title: { colSpan: 8 },
                    price: { colSpan: 6 },
                    currency: { colSpan: 6 },
                    description: { colSpan: 12 },
                    category: { colSpan: 6 },
                    subcategory: { colSpan: 6 },
                    isAvailable: { colSpan: 12 },
                },
            },
        },
        {
            type: 'inline',
            label: 'В лінію',
            config: {
                type: 'inline',
                fieldLayouts: {
                    description: { width: '100%' },
                },
            },
        },
        {
            type: 'columns',
            label: 'Колонки',
            config: {
                type: 'columns',
                columns: 2,
                fieldLayouts: {
                    description: { colSpan: 2 },
                    isAvailable: { colSpan: 2 },
                },
            },
        },
    ];

    const handleSubmit = (data: any) => {
        console.log('Form data:', data);
    };

    return (
        <Box>
            <Tabs
                value={selectedLayout}
                onChange={(_, newValue) => setSelectedLayout(newValue)}
                sx={{ mb: 3 }}
            >
                {layouts.map((layout, index) => (
                    <Tab key={layout.type} label={layout.label} value={index} />
                ))}
            </Tabs>

            <GenericForm
                title="Додати товар"
                fields={fields}
                onSubmit={handleSubmit}
                defaultValues={{
                    currency: 'UAH',
                    isAvailable: true,
                }}
                layout={layouts[selectedLayout].config || { type: layouts[selectedLayout].type }}
            />
        </Box>
    );
}; 