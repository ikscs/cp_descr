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
    // control, // Available if you prefer to use Controller for Select
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
      // When the dialog opens, usePersonForm is responsible for initializing the form
      // based on idForHook and groupIdForDefaultsInHook.
      // If personToEdit is a template for a NEW person (idForHook is undefined),
      // and it contains initial values (like name), we ensure they are applied here,
      // as usePersonForm might only set its known defaults (e.g., group_id).
      if (!idForHook && personToEdit && isNewPersonTemplate) {
        reset({
          name: personToEdit.name || '',
          group_id: groupIdForDefaultsInHook, // Correct for new, but the hook should handle it.
          // email: personToEdit.email || '',  //  No email in the template.

          //  To handle cases with prepopulated template data.
          // ...(personToEdit.email ? { email: personToEdit.email } : {}),
          // ... (other fields from personToEdit as needed),
        });
      } else if (idForHook && personToEdit) {
        reset({
          name: personToEdit.name || '',
          group_id: personToEdit.group_id,  //  Correctly set for editing
          // ...(personToEdit.email ? { email: personToEdit.email } : {}),  // Ensure the email is reset too.
          // any other fields from personToEdit that are part of the form
        });
      }
      // else, usePersonForm handles it (either fetching for idForHook, or basic new form for !idForHook)
    } else {
      // Reset form to a completely clean state when dialog is closed.
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
                <Select
                  labelId="group-select-label"
                  label="Group"
                  {...register('group_id')} // Zod schema coerces value to number
                  disabled={loadingGroups || groups.length === 0 || isSubmitting}
                  // defaultValue removed; RHF controls the value via reset/defaultValues in usePersonForm
                >
                  {loadingGroups && <MenuItem value=""><em>Loading groups...</em></MenuItem>}
                  {!loadingGroups && groups.length === 0 && <MenuItem value=""><em>No groups available</em></MenuItem>}
                  {groups.map((group) => (
                    <MenuItem key={group.group_id} value={group.group_id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
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