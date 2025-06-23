import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material'; // Assuming Material-UI, adjust as needed
import { usePersonForm } from './usePersonForm';
import { Person } from './person.types';
import { Group } from '../Groups/group.types';
import groupApi from '../../api/data/groupApi';
import { useCustomer } from '../../context/CustomerContext';
import { Controller } from 'react-hook-form';

export interface PersonFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (person: Person) => void;
  personToEdit?: Person | null; // Person object for editing, or null/template for new
  defaultGroupId?: number; // Fallback default group ID for new persons if not in personToEdit template
}

const PersonForm: React.FC<PersonFormProps> = ({
  open,
  onClose,
  onSaved,
  personToEdit,
  defaultGroupId,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const { customerData, } = useCustomer(); 
  const customer_id = customerData?.customer || -1;

  const isNewPersonTemplate = personToEdit && (personToEdit.person_id === 0 || personToEdit.person_id === undefined);
  const idForHook = isNewPersonTemplate ? undefined : personToEdit?.person_id;

  let groupIdForDefaultsInHook: number | undefined = defaultGroupId;
  if (isNewPersonTemplate && typeof personToEdit?.group_id === 'number' && personToEdit.group_id !== -1) {
    groupIdForDefaultsInHook = personToEdit.group_id;
  }

  const {
    register,
    handleSubmit,
    reset,
    errors,
    isSubmitting,
    control, // <-- добавьте это
  } = usePersonForm({
    id: idForHook,
    defaultGroupId: groupIdForDefaultsInHook,
    onSuccess: (person) => {
      onSaved(person);
      onClose(); // Close dialog on successful save
    },
    onError: (error) => {
      console.error("Error saving person:", error);
      // Potentially show a user-facing error message here
    },
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const fetchedGroups = await groupApi.get(customer_id);
        setGroups(fetchedGroups || []);
      } catch (error) {
        console.error("Failed to fetch groups", error);
        setGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    if (open) {
      fetchGroups();
    }
  }, [open, customer_id]); // Added customer_id as dependency for fetchGroups

  useEffect(() => {
    if (open) {
      if (!idForHook && personToEdit && isNewPersonTemplate) {
        reset({
          name: personToEdit.name || '',
          group_id: typeof groupIdForDefaultsInHook === 'number' ? groupIdForDefaultsInHook : undefined,
        });
      } else if (idForHook && personToEdit) {
        reset({
          name: personToEdit.name || '',
          group_id: typeof personToEdit.group_id === 'number' ? personToEdit.group_id : undefined,
        });
      }
    } else {
      reset({ name: '', group_id: undefined });
    }
  }, [open, reset, personToEdit, idForHook, isNewPersonTemplate, groupIdForDefaultsInHook]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{idForHook ? 'Edit Person' : 'Create Person'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ paddingTop: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                variant="outlined"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            {/* Add email field */}
            {/* <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                variant="outlined"
                {...register('email')}  //  Register the email field!
                error={!!errors.email}
                helperText={errors.email?.message}
              /> */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.group_id}>
                <InputLabel id="group-select-label">Group</InputLabel>
                <Controller
                  name="group_id"
                  control={control}
                  defaultValue={typeof groupIdForDefaultsInHook === 'number' ? groupIdForDefaultsInHook : undefined}
                  render={({ field }) => (
                    <Select
                      labelId="group-select-label"
                      label="Group"
                      {...field}
                      value={typeof field.value === 'number' ? field.value : undefined}
                      disabled={loadingGroups || groups.length === 0 || isSubmitting}
                    >
                      <MenuItem value={undefined}><em>Не выбрано</em></MenuItem>
                      {loadingGroups && <MenuItem value={-1}><em>Loading groups...</em></MenuItem>}
                      {!loadingGroups && groups.length === 0 && <MenuItem value={-1}><em>No groups available</em></MenuItem>}
                      {groups.map((group) => (
                        <MenuItem key={group.group_id} value={group.group_id}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.group_id && <FormHelperText>{errors.group_id.message}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary" disabled={isSubmitting || loadingGroups}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PersonForm;