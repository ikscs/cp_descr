import React from 'react';
import {
    Box,
    Button,
    Typography,
    Grid,
    Paper,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    return (
        <>
            <Typography variant="h6" gutterBottom>
                {t('PointAdvancedForm.title')}: {point.country} / {point.city} / {point.name}
            </Typography>

            <Grid container spacing={3}>
                {/* Атрибуты точки */}
                {/* <Grid item xs={12}>
                    <Paper sx={{ p: 2, mb: 2, }}>
                        <Typography variant="h6" gutterBottom>
                            Атрибути пункта обрахунку
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">ID:</Typography>
                                <Typography>{point.point_id}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">{t('PointForm.name')}</Typography>
                                <Typography>{point.name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">{t('PointForm.country')}</Typography>
                                <Typography>{point.country}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">{t('PointForm.city')}</Typography>
                                <Typography>{point.city}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid> */}

                {/* Список камер */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {t('PointAdvancedForm.CamerasAndRegistrators')}
                        </Typography>
                        <OriginList pointIdFilter={point.point_id} />
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={onClose} sx={{ mr: 1 }} variant='outlined'>
                    {t('PointAdvancedForm.Close')}
                </Button>
            </Box>
        </>
    );
};

export default PointAdvancedForm; 