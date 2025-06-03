// import React from 'react';
import { Typography, Box } from '@mui/material';
// import { ExampleForm } from '../../components/Customer/ExampleForm';
import { CustomerDetailsForm } from '../../components/Customer/CustomerDetailsForm';

const GeneralSettings = () => {
  return (
    <Box p={2}>
      <Typography variant="h4">Загальні налаштування</Typography>
      <CustomerDetailsForm />
    </Box>
  );
};

export default GeneralSettings;
