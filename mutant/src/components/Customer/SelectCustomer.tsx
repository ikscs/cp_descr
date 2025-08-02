import React, { useState, useEffect } from 'react';
import {
    Box,
    Alert,
    CircularProgress,
    Paper,
    SelectChangeEvent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from '@mui/material';
import { useDataModule } from '../../api/datamodule/DataModuleContext';
import { CustomerData, useCustomer } from '../../context/CustomerContext';
import { DataItem } from '../../api/datamodule/types';
import { updateUserCache } from '../../api/data/customerTools';
import { useUserfront } from '@userfront/react';
import { useNavigate } from 'react-router-dom';
import { pointApi } from '../../api/data/pointApi';

export const SelectCustomer: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchDataSets, data, error: dataError } = useDataModule();
    const [customers, setCustomers] = useState<DataItem[]>([]);
    const customer = useCustomer();
    const [selectedCustomer, setSelectedCustomer] = useState<number>(customer.customerData?.customer || 10); 
    const userfront = useUserfront();

    useEffect(() => {
        const fetchCustomers = fetchDataSets(['customers', 'points']);
    }, []); // Пустой массив зависимостей, чтобы запустить эффект один раз при монтировании

    useEffect(() => {
        const data1: DataItem[] = data['customers'];
        setCustomers(data1  || []);
        setIsLoading(false);
    }, [data]); 
    
    const handleChange = (event: SelectChangeEvent) => {
        setSelectedCustomer(parseInt(event.target.value));
        console.log("Выбран ID клиента:", event.target.value);
    };

    const handleSave = async () => {
        console.log("Сохраняем выбранный ID клиента:", selectedCustomer);
        await updateUserCache(selectedCustomer, userfront.user.userId, userfront.tenantId, userfront.mode.value);

        // if (0) {
        // const userfront = useUserfront();
        // userfront.setCustomerData({
        //     customer: selectedCustomer,
        // });
        // navigate('/logout')
        // return

        // Обновляем состояние контекста клиента
        const temp = customer.customerData;
        if (!temp) {
            console.warn("customerData is null, cannot update customer.");
            return;
        }
        temp.customer = selectedCustomer;
        const points = (await (pointApi.getPoints() || [])).map(point => ({
            value: point.point_id,
            label: point.name,
        }));
        temp.points = [];
        points.forEach((point) => {
            temp.points?.push(point);
            console.log("Добавляем точку:", point);
        });
        customer.customerData = temp;
        console.log("Обновленный контекст клиента:", customer.customerData);


        // Обновляем контекст клиента
        // if (customer && customer.setCustomerData) {
        //     customer.setCustomerData({ customer: selectedCustomer });
        //     console.log("Контекст клиента обновлен:", { customer: selectedCustomer });
        // } else {
        //     console.warn("Функция setCustomerData не найдена в контексте клиента.");
        // }

        // }
    };

    return (
        <Paper sx={{ p: 3, m: 2, maxWidth: 500, margin: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Вибір клієнта
            </Typography>
            <Box sx={{ mt: 2 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                    <FormControl fullWidth>
                        <InputLabel id="customer-select-label">Клиент</InputLabel>
                        <Select
                            labelId="customer-select-label"
                            id="customer-select"
                            value={String(selectedCustomer)}
                            label="Клієнт"
                            onChange={handleChange}
                        >
                            {customers.map((customer) => (
                                <MenuItem key={customer.value} value={customer.value}>
                                    {customer.value} - {customer.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            fullWidth
                            disabled={isLoading} // Кнопка неактивна пока идет загрузка
                            sx={{ mt: 20 }} // отступ сверху
                        >
                            Зберегти вибір
                    </Button>
                    </>
                )}
            </Box>
        </Paper>
    );
};
