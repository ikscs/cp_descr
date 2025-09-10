import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormHelperText,
    Grid,
    Modal,
    Box
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import packageJson from '../../../package.json';
import { ParamValue, ReportName, Schedule } from "./Schedule";
import { useFetch } from '../../hooks/useFetch';
import { api, cronTransitions } from './api';
import { useUserfront } from '@userfront/react';
import { useCustomer } from '../../context/CustomerContext';
import ScheduleParam from './ScheduleParam';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export interface ScheduleFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (schedule: Schedule) => void;
    // scheduleToEdit?: Schedule;
    initialSchedule?: Schedule;
}

// Схема валидации с помощью Yup
const validationSchema = yup.object().shape({
    id: yup.number().required(), // `id` is a number and required. -1 for new schedule
    app_id: yup.string().required('App ID is required'),
    customer_id: yup.number().required('customer_id is required').typeError('customer_id must be a number'),
    report_id: yup.number().required('Report is required').typeError('Report must be a number'),
    maillist: yup.string().required('Mailing list is required'),
    // comment: yup.string().nullable().notRequired(),
    comment: yup.string().nullable().default(null),
    lang: yup.string().required('Language is required'),
    cron: yup.string().required('CRON expression is required'),
    enable: yup.boolean().required().default(true),
    params: yup.array().of(
        yup.object({
            name: yup.string().required(),
            value: yup.mixed<string | number | boolean>().required(),
        })
    ).required().default([]),
});

const ScheduleForm: React.FC<ScheduleFormProps> = ({
    open,
    onClose,
    onSave,
    // scheduleToEdit
    initialSchedule
}) => {
    const { t } = useTranslation();
    const { data: reports } = useFetch<ReportName[]>(api.getReportName, []);
    const Userfront = useUserfront();
    const { customerData, isLoading: isCustomerLoading } = useCustomer();
    const [isParamOpen, setIsParamOpen] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | undefined>(initialSchedule);
    const [paramCount, setParamCount] = useState(scheduleToEdit?.params?.length || 0);

    const cronList = cronTransitions.map(({ label }) => ({ 
        value: label, 
        label: t(label) 
    }));

    const methods = useForm<Schedule>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            id: -1,
            app_id: packageJson.name,
            customer_id: customerData?.customer,
            report_id: -1,
            report_name: '',
            maillist: Userfront.user.email,
            comment: '',
            lang: 'uk',
            cron: 'daily',
            enable: true,
            params: []
        }
    });

    const { watch, trigger, handleSubmit, reset, control, setValue, formState: { errors }  } = methods;

    const reportIdValue = watch('report_id');
    useEffect(() => {
        
        if (reportIdValue == -1) return;
        if (reports.length == 0) return;

        const {report_config} = reports.find(report => report.report_id === reportIdValue) || {params: []};
        const params = JSON.parse(report_config || '{}').params || [];
        setValue('params', params);
        // setValue('params', [{name: "d1", "value": "2029-09-09"}, {name: "d2", "value": "2029-10-10"}, ]);
        // trigger('params'); // Вызываем рендеринг после установки значения
        setParamCount(params.length);
        if (scheduleToEdit) scheduleToEdit.params = params;
        setScheduleToEdit(scheduleToEdit);
    }, [reportIdValue, setValue, trigger]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Form validation errors:', errors);
        }
    }, [errors]);

    useEffect(() => {
        if (scheduleToEdit) {
            reset({
                ...scheduleToEdit,
                report_name: reports?.find(r => r.report_id === scheduleToEdit.report_id)?.report_name || ''
            });
        } else {
            reset();
        }
    }, [scheduleToEdit, reset, reports]);

    const handleSave = (data: Schedule) => {
        // Устанавливаем report_name на основе выбранного report_id
        const selectedReport = reports?.find(r => r.report_id === data.report_id);
        const scheduleToSave = {
            ...data,
            report_name: selectedReport ? selectedReport.report_name : ''
        };
        onSave(scheduleToSave);
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSaveParam = (params: ParamValue[]) => {
        // const paramsObject = params.reduce((acc: any, param) => {
        //     acc[param.name] = param.value;
        //     return acc;
        // }, {});

        // setValue('params', paramsObject);
        setValue('params', params, { shouldDirty: true });
        if (scheduleToEdit) scheduleToEdit.params = params;
        setIsParamOpen(false);
    }

    const handleCloseModal = () => {
        setIsParamOpen(false);
    };

    const handleParam = () => {
        setIsParamOpen(true);
    };

    const handleTestReport = async () => {
        const data = methods.getValues();
        const res = await api.testReport({
            lang: data.lang,
            app_id: data.app_id,
            report_id: data.report_id,
            parameters: data.params,
            recipient: data.maillist
        });
        if (res) {
            alert('Звіт успішно відправлено');
        } else {
            alert('Помилка відправки звіту');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(handleSave)}>
                    <DialogTitle>{scheduleToEdit ? t('ScheduleForm.editSchedule') : t('ScheduleForm.addSchedule')}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name="id"
                                    control={control}
                                    render={({ field }) => (
                                        <input type="hidden" {...field} />
                                    )}
                                />                            
                                <Controller
                                    name="app_id"
                                    control={control}
                                    render={({ field }) => (
                                        <input type="hidden" {...field} />
                                    )}
                                />
                                <Controller
                                    name="customer_id"
                                    control={control}
                                    render={({ field }) => (
                                        <input type="hidden" {...field} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="report_id"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl fullWidth margin="normal" required error={!!error}>
                                            <InputLabel id="report-id-label">{t('ScheduleForm.reportName')}</InputLabel>
                                            <Select
                                                labelId="report-id-label"
                                                {...field}
                                                label={t('ScheduleForm.reportName')}
                                            >
                                                {reports?.map((report) => (
                                                    <MenuItem key={report.report_id} value={report.report_id}>
                                                        {report.report_name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {error && <FormHelperText>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>{/*maillist*/}
                                <Controller
                                    name="maillist"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <TextField
                                            {...field}
                                            label={t('ScheduleForm.maillist')}
                                            multiline
                                            rows={4} 
                                            fullWidth
                                            margin="normal"
                                            required
                                            error={!!error}
                                            helperText={error?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>{/*comment*/}
                                <Controller
                                    name="comment"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <TextField
                                            {...field}
                                            label={t('ScheduleForm.comment')}
                                            fullWidth
                                            margin="normal"
                                            error={!!error}
                                            helperText={error?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Grid container direction="row" spacing={2} alignItems="center">

                                    <Grid item xs={6}>{/*cron*/}
                                        <Controller
                                            name="cron"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormControl fullWidth error={!!error}>
                                                    <InputLabel id="cron-label">{t('ScheduleForm.cron')}:</InputLabel>
                                                    <Select
                                                        labelId="cron-label"
                                                        id="cron"
                                                        label={t('ScheduleForm.cron')}
                                                        {...field}
                                                    >
                                                    <MenuItem value="">
                                                        <em>{t('ScheduleForm.select')}</em>
                                                    </MenuItem>
                                                    {cronList.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                        </MenuItem>
                                                    ))}
                                                    </Select>
                                                    {error && (
                                                    <FormHelperText>{error.message}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            )}
                                            // rules={{ required: 'Это поле обязательно' }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>{/*enable*/}
                                        <Controller
                                            name="enable"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={<Checkbox {...field} checked={field.value} />}
                                                    label={t('ScheduleForm.enable')}
                                                />
                                            )}
                                        />
                                    </Grid>

                                </Grid>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleTestReport} variant="outlined" color="primary">
                            {t('ScheduleForm.testReport')}
                        </Button>
                        <Button 
                            onClick={handleParam} 
                            variant="outlined" 
                            color="primary"
                            // disabled={scheduleToEdit?.params?.length === 0}
                            disabled={paramCount == 0}
                            >
                            {t('ScheduleForm.parameters')}
                        </Button>
                        <Button onClick={handleClose} variant="outlined" color="primary">
                            {t('ScheduleForm.cancel')}
                        </Button>
                        <Button type="submit" color="primary" variant="contained">
                            {t('ScheduleForm.save')}
                        </Button>
                    </DialogActions>
                </form>
            </FormProvider>

            <Modal
                open={isParamOpen}
                onClose={handleCloseModal}
                aria-labelledby="schedule-form-modal-title"
                aria-describedby="schedule-form-modal-description"
            >
                <Box sx={style}>
                    <ScheduleParam
                        // reportId={scheduleToEdit?.report_id || -1}
                        reportId={reportIdValue || -1}
                        params={scheduleToEdit?.params || []}
                        // open={isParamOpen}
                        onSave={handleSaveParam}
                        onClose={handleCloseModal}

                        // scheduleToEdit={selectedSchedule}
                    />
                </Box>
            </Modal>
        </Dialog>
    );
};

export default ScheduleForm;