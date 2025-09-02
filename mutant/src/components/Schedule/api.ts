import axios from 'axios';
import { DbSchedule, ReportName, Schedule } from './Schedule';

const API_URL = 'https://cnt.theweb.place/api/pcnt/report_schedule/';

const get = async (): Promise<Schedule[]> => {
    const res = await axios.get<Schedule[]>('https://cnt.theweb.place/api/pcnt/v_report_schedule/');
    return res.data;
}

const post = async (data: Partial<Omit<DbSchedule, 'id'>>): Promise<Schedule> => {
    const res = await axios.post<Schedule>(API_URL, data);
    return res.data;
}
const patch = async (data: DbSchedule): Promise<Schedule> => {
    const { id } = data;
    console.log('[Schedule api] patch called for id:', id);
    const res = await axios.put<Schedule>(API_URL + `${id}/`, data);
    return res.data;
}

const del = async (id: number): Promise<void> => {
    console.log('[Schedule api] del called for id:', id);
    await axios.delete(API_URL + `${id}/`);
}

const getReportName = async (): Promise<ReportName[]> => {
    const res = await axios.get<ReportName[]>(
        'https://cnt.theweb.place/api/pcnt/v_perm_report/?app_id=mutant&lang=uk');
    return res.data;
}

// const getReport = async (reportId: number): Promise<Report[]> => {
//     const res = await axios.get<Report[]>(
//         'https://cnt.theweb.place/api/pcnt/perm_report/?app_id=mutant&lang=uk/report_id=' + reportId);
//     return res.data;
// }

export const api = {
    getReportName,
    get,
    post,
    patch,
    del,
};

export const cronTransitions   = [
    {label: 'daily',  cron: '0 0 * * *'},
    {label: 'weekly', cron: '0 0 * * 0'},
    {label: 'monthly',cron: '0 0 1 * *'},
];

export const cronToLabel = (cron: string): string => {
    return cronTransitions.find(item => item.cron === cron)?.label || 'unknown';
}

export const cronFromLabel = (label: string): string => {
    return cronTransitions.find(item => item.label === label)?.cron || cronTransitions[0].cron;
}
