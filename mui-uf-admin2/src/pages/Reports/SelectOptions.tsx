// SelectOptions.tsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface SelectOptionsProps {
  options: string[];
  onSave: (newOptions: string[]) => void;
  onClose: () => void;
}

const SelectOptions: React.FC<SelectOptionsProps> = ({ options, onSave, onClose }) => {
  const [currentOptions, setCurrentOptions] = useState<string[]>(options);
  const [newOption, setNewOption] = useState<string>('');

  const handleAddOption = () => {
    if (newOption.trim() !== '') {
      setCurrentOptions([...currentOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleDeleteOption = (index: number) => {
    const updatedOptions = [...currentOptions];
    updatedOptions.splice(index, 1);
    setCurrentOptions(updatedOptions);
  };

  const handleSave = () => {
    onSave(currentOptions);
    onClose();
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="New Option"
        value={newOption}
        onChange={(e) => setNewOption(e.target.value)}
        margin="normal"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAddOption();
          }
        }}
      />
      <Button variant="outlined" onClick={handleAddOption}>
        Add Option
      </Button>
      <Box mt={2}>
        {currentOptions.map((option, index) => (
          <Box key={index} display="flex" alignItems="center" mt={1}>
            <Typography>{option}</Typography>
            <IconButton onClick={() => handleDeleteOption(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default SelectOptions;
