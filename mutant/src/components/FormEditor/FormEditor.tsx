import React, { useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    MenuItem,
    IconButton,
    Typography,
    Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided } from 'react-beautiful-dnd';
import { FormConfig, FieldConfig, FieldType, LayoutType } from '../../types/form';

// Компонент-обертка для StrictMode
const StrictModeDroppable = ({ children, ...props }: any) => {
    const [enabled, setEnabled] = useState(false);

    React.useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    if (!enabled) {
        return null;
    }

    return <Droppable {...props}>{children}</Droppable>;
};

interface FormEditorProps {
    initialConfig?: FormConfig;
    onSave: (config: FormConfig) => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({ initialConfig, onSave }) => {
    const [formConfig, setFormConfig] = useState<FormConfig>(initialConfig || {
        title: '',
        fields: [],
        layout: { type: 'stack' }
    });

    const createDefaultFieldByType = (type: FieldType, baseField: Partial<FieldConfig>): FieldConfig => {
        const base = {
            name: baseField.name || '',
            label: baseField.label || '',
            required: baseField.required || false,
            defaultValue: baseField.defaultValue
        };

        switch (type) {
            case 'text':
                return { ...base, type: 'text' };
            case 'number':
                return { ...base, type: 'number' };
            case 'select':
                return { ...base, type: 'select', options: [] };
            case 'switch':
                return { ...base, type: 'switch' };
            case 'dynamic-select':
                return {
                    ...base,
                    type: 'dynamic-select',
                    loadOptions: async () => []
                };
            default:
                return { ...base, type: 'text' };
        }
    };

    const handleAddField = () => {
        const newField = createDefaultFieldByType('text', {
            name: `field${formConfig.fields.length + 1}`,
            label: `Field ${formConfig.fields.length + 1}`
        });

        setFormConfig(prev => ({
            ...prev,
            fields: [...prev.fields, newField]
        }));
    };

    const handleFieldChange = (index: number, updates: Partial<FieldConfig>) => {
        setFormConfig(prev => {
            const updatedFields = prev.fields.map((field, i) => {
                if (i !== index) return field;

                if (updates.type && updates.type !== field.type) {
                    return createDefaultFieldByType(updates.type, { ...field, ...updates });
                }

                return { ...field, ...updates } as FieldConfig;
            });

            return {
                ...prev,
                fields: updatedFields
            };
        });
    };

    const handleDeleteField = (index: number) => {
        setFormConfig(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const fields = Array.from(formConfig.fields);
        const [reorderedItem] = fields.splice(result.source.index, 1);
        fields.splice(result.destination.index, 0, reorderedItem);

        setFormConfig(prev => ({
            ...prev,
            fields
        }));
    };

    const handleSaveClick = () => {
        onSave(formConfig);
    };

    return (
        <Paper sx={{ p: 3, borderRadius: '8px' }}>
            <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Form Editor</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveClick}
                    >
                        Save Form
                    </Button>
                </Box>

                <TextField
                    label="Form Title"
                    value={formConfig.title}
                    onChange={(e) => setFormConfig(prev => ({ ...prev, title: e.target.value }))}
                    fullWidth
                />

                <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>Layout Settings</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                select
                                fullWidth
                                label="Layout Type"
                                value={formConfig.layout.type}
                                onChange={(e) => setFormConfig(prev => ({
                                    ...prev,
                                    layout: { ...prev.layout, type: e.target.value as LayoutType }
                                }))}
                            >
                                <MenuItem value="stack">Stack</MenuItem>
                                <MenuItem value="grid">Grid</MenuItem>
                                <MenuItem value="inline">Inline</MenuItem>
                                <MenuItem value="columns">Columns</MenuItem>
                            </TextField>
                        </Grid>
                        {(formConfig.layout.type === 'grid' || formConfig.layout.type === 'columns') && (
                            <Grid item xs={6}>
                                <TextField
                                    type="number"
                                    fullWidth
                                    label="Columns"
                                    value={formConfig.layout.columns || ''}
                                    onChange={(e) => setFormConfig(prev => ({
                                        ...prev,
                                        layout: { ...prev.layout, columns: parseInt(e.target.value) || undefined }
                                    }))}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Box>

                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Fields</Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddField}
                        >
                            Add Field
                        </Button>
                    </Box>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <StrictModeDroppable droppableId="fields">
                            {(provided: DroppableProvided) => (
                                <Stack
                                    spacing={2}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {formConfig.fields.map((field, index) => (
                                        <Draggable
                                            key={field.name || `field-${index}`}
                                            draggableId={field.name || `field-${index}`}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <Paper
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    elevation={snapshot.isDragging ? 3 : 1}
                                                    sx={{
                                                        p: 2,
                                                        backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item>
                                                            <Box
                                                                {...provided.dragHandleProps}
                                                                sx={{
                                                                    cursor: 'move',
                                                                    color: 'action.active',
                                                                    '&:hover': {
                                                                        color: 'primary.main',
                                                                    }
                                                                }}
                                                            >
                                                                <DragIndicatorIcon />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <TextField
                                                                fullWidth
                                                                label="Field Name"
                                                                value={field.name}
                                                                onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <TextField
                                                                fullWidth
                                                                label="Label"
                                                                value={field.label}
                                                                onChange={(e) => handleFieldChange(index, { label: e.target.value })}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <TextField
                                                                select
                                                                fullWidth
                                                                label="Type"
                                                                value={field.type}
                                                                onChange={(e) => handleFieldChange(index, { type: e.target.value as FieldType })}
                                                            >
                                                                <MenuItem value="text">Text</MenuItem>
                                                                <MenuItem value="number">Number</MenuItem>
                                                                <MenuItem value="select">Select</MenuItem>
                                                                <MenuItem value="switch">Switch</MenuItem>
                                                                <MenuItem value="dynamic-select">Dynamic Select</MenuItem>
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleDeleteField(index)}
                                                                size="small"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Stack>
                            )}
                        </StrictModeDroppable>
                    </DragDropContext>
                </Box>
            </Stack>
        </Paper>
    );
}; 