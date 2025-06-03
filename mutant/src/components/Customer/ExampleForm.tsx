import { useForm } from 'react-hook-form';
import { Button, Paper, Stack } from '@mui/material';
import { DynamicSelect } from '../generic/DynamicSelect';

interface FormData {
    category: string;
    subcategory: string;
}

// Пример асинхронной загрузки опций
const loadCategories = async () => {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
        { value: 'electronics', label: 'Electronics' },
        { value: 'books', label: 'Books' },
        { value: 'clothing', label: 'Clothing' },
    ];
};

const loadSubcategories = async (categoryId: string) => {
    // Имитация API запроса с зависимостью от выбранной категории
    await new Promise(resolve => setTimeout(resolve, 1000));
    const subcategories = {
        electronics: [
            { value: 'phones', label: 'Phones' },
            { value: 'laptops', label: 'Laptops' },
        ],
        books: [
            { value: 'fiction', label: 'Fiction' },
            { value: 'science', label: 'Science' },
        ],
        clothing: [
            { value: 'shirts', label: 'Shirts' },
            { value: 'pants', label: 'Pants' },
        ],
    };
    return subcategories[categoryId as keyof typeof subcategories] || [];
};

export const ExampleForm = () => {
    const { control, handleSubmit, watch } = useForm<FormData>();
    const selectedCategory = watch('category');

    const onSubmit = (data: FormData) => {
        console.log('Form data:', data);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: '28px', // MD3 style
                bgcolor: 'background.paper'
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <DynamicSelect<FormData>
                        name="category"
                        label="Category"
                        control={control}
                        loadOptions={(loadCategories)}
                        required
                    />

                    <DynamicSelect<FormData>
                        name="subcategory"
                        label="Subcategory"
                        control={control}
                        loadOptions={() => loadSubcategories(selectedCategory)}
                        disabled={!selectedCategory}
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            borderRadius: '20px', // MD3 style
                            textTransform: 'none', // MD3 style
                            py: 1.5
                        }}
                    >
                        Submit
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
}; 