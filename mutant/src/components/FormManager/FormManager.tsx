import React, { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { FormEditor } from '../FormEditor/FormEditor';
import { GenericForm } from '../generic/GenericForm';
import EditIcon from '@mui/icons-material/Edit';
import PreviewIcon from '@mui/icons-material/Preview';
import { FormConfig } from '../../types/form';

interface FormManagerProps {
    initialConfig?: FormConfig;
    onSave?: (config: FormConfig) => void;
}

export const FormManager: React.FC<FormManagerProps> = ({ initialConfig, onSave }) => {
    const [isEditMode, setIsEditMode] = useState(true);
    const [currentConfig, setCurrentConfig] = useState<FormConfig>(initialConfig || {
        title: '',
        fields: [],
        layout: { type: 'stack' }
    });

    const handleSave = (config: FormConfig) => {
        setCurrentConfig(config);
        if (onSave) {
            onSave(config);
        }
    };

    const handleFormSubmit = (data: any) => {
        console.log('Form submitted with data:', data);
        // Handle form submission here
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4">
                    {isEditMode ? 'Form Editor' : 'Form Preview'}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={isEditMode ? <PreviewIcon /> : <EditIcon />}
                    onClick={() => setIsEditMode(!isEditMode)}
                >
                    {isEditMode ? 'Preview' : 'Edit'}
                </Button>
            </Stack>

            {isEditMode ? (
                <FormEditor
                    initialConfig={currentConfig}
                    onSave={handleSave}
                />
            ) : (
                <GenericForm
                    {...currentConfig}
                    onSubmit={handleFormSubmit}
                />
            )}
        </Box>
    );
}; 