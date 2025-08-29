import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Person } from './person.types';

interface PersonFormPlaceholderProps {
  person?: Person | null;
  onSubmit: (person: Person) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PersonFormPlaceholder: React.FC<PersonFormPlaceholderProps> = ({ person, onSubmit, onCancel, isSubmitting }) => {
  const handleSubmit = () => {
    if (person) {
      onSubmit(person);
    } else {
      // This case should ideally be handled by ensuring `person` is always provided
      console.error("Person data is missing in placeholder form submit");
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1 }}>
      {/* <Typography variant="h6" gutterBottom>
        {person && person.person_id !== 0 ? `Edit Person: ${person.name}` : 'Add New Person'}
      </Typography> */}
      <Typography sx={{ mb: 2 }}>
        This is a placeholder for the person editing form. Current data:
      </Typography>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(person, null, 2)}</pre>
      <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
        <Button onClick={onCancel} variant="outlined" disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save (Placeholder)'}
        </Button>
      </Stack>
    </Box>
  );
};

export default PersonFormPlaceholder;