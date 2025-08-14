import React from 'react';
import {
    Box,
    Button,
    Typography,
    Grid,
    Paper,
} from '@mui/material';
import { Point } from '../../api/data/pointApi';
import OriginList from '../Origins/OriginList';

interface PointAdvancedFormProps {
    point: Point;
    onClose: () => void;
}

const PointAdvancedForm: React.FC<PointAdvancedFormProps> = ({
    point,
    onClose,
}) => {
    return (
        <>
            <Typography variant="h6" gutterBottom>
                Розширене редагування пункта обрахунку: {point.name}
            </Typography>

            <Grid container spacing={3}>
                {/* Атрибуты точки */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Атрибути пункта обрахунку
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">ID:</Typography>
                                <Typography>{point.point_id}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Назва:</Typography>
                                <Typography>{point.name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Країна:</Typography>
                                <Typography>{point.country}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Місто:</Typography>
                                <Typography>{point.city}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Список камер */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Камери та реєстратори
                        </Typography>
                        <OriginList pointIdFilter={point.point_id} />
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={onClose} sx={{ mr: 1 }}>
                    Закрити
                </Button>
            </Box>
        </>
    );
};

export default PointAdvancedForm; 