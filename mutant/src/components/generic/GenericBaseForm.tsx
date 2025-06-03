import { Box, Stack, Typography, SxProps, Theme } from '@mui/material';
import React from 'react';

interface GenericBaseFormProps {
    title?: string;
    children: React.ReactNode; // The main form content
    actions?: React.ReactNode; // The action buttons, e.g., Save, Cancel, Edit
    actionContainerSx?: SxProps<Theme>; // Custom styles for the actions container
    titleSx?: SxProps<Theme>; // Custom styles for the title
    contentSx?: SxProps<Theme>; // Custom styles for the content wrapper
}

export const GenericBaseForm: React.FC<GenericBaseFormProps> = ({
    title,
    children,
    actions,
    actionContainerSx,
    titleSx,
    contentSx,
}) => {
    return (
        <Box>
            {title && (
                <Typography variant="h6" sx={{ mb: 3, ...titleSx }}>
                    {title}
                </Typography>
            )}
            <Box sx={{ mb: actions ? 3 : 0, ...contentSx }}>{children}</Box>
            {actions && (
                <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end', ...actionContainerSx }}>
                    {actions}
                </Stack>
            )}
        </Box>
    );
};