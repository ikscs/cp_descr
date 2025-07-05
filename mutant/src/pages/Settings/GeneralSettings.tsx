// import React from 'react';
import { Typography, Box } from '@mui/material';
// import { ExampleForm } from '../../components/Customer/ExampleForm';
import { CustomerDetailsForm } from '../../components/Customer/CustomerDetailsForm';
import { useUserfront } from '@userfront/react';

const GeneralSettings = () => {
    const Userfront = useUserfront();
  
  return (
    <Box p={2}>
      <Typography variant="h4">Загальні налаштування</Typography>
      <CustomerDetailsForm />

            {Userfront.user && (
                <Box mt={4} p={2} border={1} borderColor="grey.300" borderRadius={2}>
                    <Typography variant="h5" mb={2}>Інформація про поточного користувача (Userfront.user):</Typography>
                    {/* Displaying some common user properties */}
                    <Typography><strong>ID користувача:</strong> {Userfront.user.userId}</Typography>
                    <Typography><strong>UUID:</strong> {Userfront.user.userUuid}</Typography>
                    <Typography><strong>Електронна пошта:</strong> {Userfront.user.email}</Typography>
                    <Typography><strong>Ім'я:</strong> {Userfront.user.name}</Typography>
                    <Typography><strong>Прізвище:</strong> {Userfront.user.lastName}</Typography>
                    <Typography><strong>Ім'я користувача:</strong> {Userfront.user.username}</Typography>
                    <Typography><strong>Верифікована пошта:</strong> {Userfront.user.isEmailVerified ? 'Так' : 'Ні'}</Typography>
                    <Typography><strong>Створено:</strong> {new Date(Userfront.user.createdAt).toLocaleString('uk-UA')}</Typography>
                    <Typography><strong>Оновлено:</strong> {new Date(Userfront.user.updatedAt).toLocaleString('uk-UA')}</Typography>

                    {/* Example of iterating through all properties (less common for direct display) */}
                    <Box mt={3}>
                        <Typography variant="h6">Всі доступні властивості Userfront.user (для довідки):</Typography>
                        {Object.keys(Userfront.user).map((key) => {
                            // Skip functions
                            if (typeof Userfront.user[key] === 'function') {
                                return null; 
                            }
                            return (
                                <Typography key={key} sx={{ wordBreak: 'break-all' }}>
                                    <strong>{key}:</strong> {
                                        typeof Userfront.user[key] === 'object' && Userfront.user[key] !== null
                                            ? JSON.stringify(Userfront.user[key], null, 2)
                                            : String(Userfront.user[key])
                                    }
                                </Typography>
                            );
                        })}
                    </Box>
                </Box>
            )}      
    </Box>
  );
};

export default GeneralSettings;
