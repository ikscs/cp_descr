import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Alert,
    Box,
    Button,
    Checkbox,
    Modal,
    Stack, 
    Tooltip, 
    Typography } from '@mui/material';
import { useFetch } from "../../hooks/useFetch";
import { useTranslation } from 'react-i18next';
import { DbSchedule, ParamValue, ReportName, Schedule } from './Schedule';
import { api, cronFromLabel, cronToLabel } from './api';
import LocalizedGrid from '../Shared/grid/LocalizedGrid';
import { GridColDef, GridColumnVisibilityModel, GridRenderCellParams } from '@mui/x-data-grid';
import i18n from '../../i18n';
import ScheduleForm from './ScheduleForm';
import { LocaleKey } from '../Shared/grid/locales';
import { customConfirm } from '../Shared/dialogs/confirm';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


function mapParams(params: Object): ParamValue[] {
  return Object.entries(params ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
}

function dbToSchedule(db: DbSchedule): Schedule {
  return {
    ...db,
    params: mapParams(db.params),
  };
}

function dbFromSchedule(sch: Schedule): DbSchedule {
  return {
    ...sch,
    params: sch.params.reduce<Record<string, string | number | boolean>>(
      (acc, { name, value }) => {
        acc[name] = value;
        return acc;
      },
      {}
    ),
  };
}

// TODO: cell with Tooltip black on white
// const CellWithTooltip = ({ value }) => {
//   return (
//     <Tooltip
//       title={value}
//       placement="top"
//       componentsProps={{
//         tooltip: {
//           sx: {
//             bgcolor: 'common.white', // Белый фон
//             color: 'text.primary', // Чёрный текст
//             border: '1px solid #e0e0e0', // Светлая граница
//           },
//         },
//       }}
//     >
//       <span style={{
//         whiteSpace: 'nowrap',
//         overflow: 'hidden',
//         textOverflow: 'ellipsis',
//         width: '100%',
//       }}>
//         {value}
//       </span>
//     </Tooltip>
//   );
// };

const ScheduleList: React.FC = () => {
    const { t } = useTranslation();
    const { data: rawData, loading: loading, error: fetchError, setData } = useFetch<Schedule[]>(api.get, []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>(undefined);
    const [error, setError] = useState<Error | null>(null);
    const { data: reports } = useFetch<ReportName[]>(api.getReportName, []);

    const data = useMemo(
        () =>
            rawData?.map(item => ({
                ...item,
                cron: cronToLabel(item.cron),
                params: dbToSchedule(item).params,
                })) ?? [],
        [rawData]
    );

    const handleOpenModal = (schedule: Schedule | undefined) => {
        setError(null);
        setIsModalOpen(true);
        setSelectedSchedule(schedule);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSchedule(undefined);
    };

    const handleSaveSchedule = useCallback(async (savedSchedule: Schedule) => {
        setError(null);
        try {
            const dbSchedule = dbFromSchedule(savedSchedule);
            if (selectedSchedule) {
                // Если расписание уже существует (редактирование)
                const patchedSchedule = await api.patch({...dbSchedule, cron: cronFromLabel(dbSchedule.cron)});
                const patchedWithReportName = {...patchedSchedule, report_name: reports.find(report => report.report_id === patchedSchedule.report_id)?.report_name};
                setData(prevData => prevData.map(item => item.id === patchedSchedule.id ? patchedWithReportName : item));
            } else {
                // Если это новое расписание
                const postedSchedule = await api.post({...dbSchedule, cron: cronFromLabel(dbSchedule.cron)});
                const postedWithReportName = {...postedSchedule, report_name: reports.find(report => report.report_id === postedSchedule.report_id)?.report_name};
                setData(prevData => [...prevData, postedWithReportName ]);
            }
            handleCloseModal();
        } catch (err: any) {
            console.error('[ScheduleList] Error saving schedule:', err);
            setError(new Error('Error saving schedule - ' + err.message));
        }
    }, [selectedSchedule, setData]);

    const handleDeleteSchedule = async (id: number) => {
        const isConfirmed = await customConfirm(
            t('ScheduleList.Are_you_sure'),
            t('ScheduleList.title')
        );
        if (!isConfirmed) {
            return;
        }
        // if (!window.confirm(t('ScheduleList.Are_you_sure'))) {
        //     return;
        // }
        setError(null);
        try {
            await api.del(id);
            setData((prevData) => prevData.filter((o) => o.id !== id));
        } catch (err) {
            console.error('[OriginsList] Error deleting origin:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error deleting origin.';
            setError(new Error(errorMessage));
        // } finally {
        //     setIsLoading(false);
        }
    };

    const columns: GridColDef<Schedule>[] = [
        { field: 'report_id', headerName: 'ID', width: 100 },
        { field: 'report_name', headerName: t('ScheduleList.report_name'), width: 200 },
        { field: 'cron', headerName: t('ScheduleList.cron'), width: 100,
            renderCell: (params: GridRenderCellParams<Schedule>) => (
                <span>{t(params.value)}</span>
            ),
         },
        { field: 'maillist', headerName: t('ScheduleList.maillist'), width: 200 },
        { field: 'comment', headerName: t('ScheduleList.comment'), width: 200 },
        { field: 'params', headerName: t('ScheduleList.params'), width: 100,
            renderCell: (params: GridRenderCellParams<Schedule>) => (
                <Tooltip title={JSON.stringify(params.value)}>
                    <span>{JSON.stringify(params.value)}</span>
                </Tooltip>
            ),
        },
        { field: 'enable', headerName: t('ScheduleList.enable'), width: 100,
            renderCell: (params: GridRenderCellParams<Schedule>) => (
                <Checkbox checked={params.value} disabled />
            ),
        },
        {
            field: 'actions',
            headerName: t('OriginList.Actions'),
            width: 250,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Schedule>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Stack direction="row" spacing={1}>
                    <Button
                        onClick={() => handleOpenModal(params.row)}
                        size="small"
                        variant="outlined"
                    >
                        {t('ScheduleList.Edit')}
                    </Button>
                    <Button
                        onClick={() => handleDeleteSchedule(params.row.id)}
                        size="small"
                        variant="outlined"
                        color="error"
                    >
                        {t('ScheduleList.Delete')}
                    </Button>
                </Stack>
                </Box>
            ),
        },
    ];
    const lang = i18n.language as LocaleKey;
      
    const [columnVisibilityModel, setColumnVisibilityModel] = React.useState<GridColumnVisibilityModel>({
        params: false, // 👈 Скрываем колонку 'params'
    });

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">
                    {t('ScheduleList.title')}
                </Typography>
            </Stack>
            <Button
                variant="contained"
                onClick={() => handleOpenModal(undefined)}
            >
                {t('ScheduleList.addButton')}
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {t('errorMessage', { error_message: error.message })}
                </Alert>
            )}
            <LocalizedGrid
                lang={lang}
                rows={data}
                loading={loading}
                columns={columns}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            />

            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="schedule-form-modal-title"
                aria-describedby="schedule-form-modal-description"
            >
                <Box sx={style}>
                    <ScheduleForm
                        open={isModalOpen}
                        onSave={handleSaveSchedule}
                        onClose={handleCloseModal}
                        initialSchedule={selectedSchedule}
                    />
                </Box>
            </Modal>

        </Box>
    );
};

export default ScheduleList;