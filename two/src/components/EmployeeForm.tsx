// src/components/EmployeeForm.tsx
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  // Typography, // Title is now handled by DialogTitle
  // Paper, // Remove Paper wrapper
  Grid,
} from '@mui/material';
import { useLocalization } from '../localization/LocalizationContext';
import { useEmployeeStore } from '../store/employeeStore';
import { Employee } from '../types/employee';

const initialFormState: Omit<Employee, 'id'> = {
  name: '',
  position: '',
  email: '',
};

// Define props for the component
interface EmployeeFormProps {
  onClose: () => void; // Function to close the modal
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onClose }) => { // Destructure onClose
  const { translate } = useLocalization();
  const selectedEmployeeId = useEmployeeStore((state) => state.selectedEmployeeId);
  const employees = useEmployeeStore((state) => state.employees);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const selectEmployee = useEmployeeStore((state) => state.selectEmployee);

  const [formData, setFormData] = useState<Omit<Employee, 'id'>>(initialFormState);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (selectedEmployeeId !== null) {
      const employeeToEdit = employees.find((emp) => emp.id === selectedEmployeeId);
      if (employeeToEdit) {
        setFormData({
          name: employeeToEdit.name,
          position: employeeToEdit.position,
          email: employeeToEdit.email,
        });
        setIsEditing(true);
      } else {
        // If ID selected but not found, reset form and clear selection
        setFormData(initialFormState);
        setIsEditing(false);
        selectEmployee(null); // Clear invalid selection
      }
    } else {
      // If no ID selected, reset form for adding new
      setFormData(initialFormState);
      setIsEditing(false);
    }
    // Only re-run if selectedEmployeeId changes.
    // Avoid dependency on 'employees' if possible to prevent unnecessary reruns,
    // unless finding the employee *must* happen here.
    // If the store guarantees 'employees' is stable when 'selectedEmployeeId' is valid,
    // you can remove 'employees' and 'selectEmployee' from deps.
  }, [selectedEmployeeId, employees, selectEmployee]); // Keep selectEmployee if used in the 'else' block

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing && selectedEmployeeId !== null) {
      updateEmployee({ ...formData, id: selectedEmployeeId });
    } else {
      addEmployee(formData);
    }
    selectEmployee(null); // Clear selection after submit
    onClose(); // Close the modal after successful submission
  };

  const handleCancel = () => {
    selectEmployee(null); // Clear selection on cancel
    onClose(); // Close the modal
    // Form reset will happen via useEffect when selectedEmployeeId becomes null
  };

  // No Paper wrapper needed here, DialogContent provides padding
  return (
    // Remove Paper and Typography for title
    // <Paper elevation={3} sx={{ p: 3 }}>
    //   <Typography variant="h6" component="h2" gutterBottom>
    //     {isEditing ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
    //   </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              required
              fullWidth
              id="name"
              // label="Имя"
              label={translate('nameLabel')} // Используем translate
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoFocus // Good for modals
              margin="dense" // Use dense margin in modals
            />
          </Grid>
          <Grid size={12}> {/* Use item prop and xs sizing */}
            <TextField
              required
              fullWidth
              id="position"
              // label="Должность"
              label={translate('positionLabel')}
              name="position"
              value={formData.position}
              onChange={handleChange}
              margin="dense" // Use dense margin in modals
            />
          </Grid>
           <Grid size={12}> {/* Use item prop and xs sizing */}
            <TextField
              required
              fullWidth
              id="email"
              // label="Email"
              label={translate('emailLabel')} 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="dense" // Use dense margin in modals
            />
          </Grid>
        </Grid>
        {/* Buttons are typically placed at the bottom */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2 }}>
           {/* Use the cancel handler */}
           <Button
             type="button"
             onClick={handleCancel} // Use handleCancel
             variant="outlined"
             sx={{ mr: 1 }}
           >
             {/* Отмена */}
             {translate('cancelBtn')}
           </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.name || !formData.position || !formData.email}
          >
            {/* {isEditing ? 'Сохранить изменения' : 'Добавить сотрудника'} */}
            {translate(isEditing ? 'saveBtn' : 'addBtn')}
          </Button>
        </Box>
      </Box>
    // </Paper>
  );
};
