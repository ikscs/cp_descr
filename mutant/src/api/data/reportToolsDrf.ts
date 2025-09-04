import axios from 'axios';
import packageJson from '../../../package.json';
import type { Parameter } from '../../pages/Reports/QueryParam';
import { ReportExecutionResult } from "../../pages/Reports/ReportList";
import { IFetchResponse } from './fetchData';

export interface Report {
  id: number;
  name: string;
  description: string;
  params: Parameter[];
  config?: string,
  query: string;
}

export interface ReportDB {
  report_id: number;
  report_name: string;
  report_description: string;
  params: Parameter[];
  report_config?: string,
  query: string;
}

const toReportDB = (report: Report): ReportDB => (
    {
        report_id: report.id,
        report_name: report.name,
        report_description: report.description,
        params: report.params,
        report_config: report.config,
        query: report.query,
    }
);

const fromReportDB = (report: ReportDB[]): Report[] => {
    return report.map((report) => ({
        id: report.report_id,
        name: report.report_name,
        description: report.report_description,
        params: report.params,
        config: report.report_config,
        query: report.query,
    }));
};


export const executeReportQuery = async (
    id: number,
    params: { name: string; value: string | number | boolean }[],
    lang: string = 'uk',
): Promise<ReportExecutionResult> => {
    const paramsToSend = {
        app_id: packageJson.name,
        report_id: id,
        parameters: params,
        lang,
    };
    console.log('[executeReportQuery] run report with params:', paramsToSend);
    const res0 = await axios.post<IFetchResponse>('https://cnt.theweb.place/api/report/', paramsToSend);
    const res: any = res0.data || {ok: false, data: []};
    if (res.ok) {
        console.log('[executeReportQuery] result:', res);
        const columns = Object.keys(res.data[0]);
        const rows = res.data.map((row: any) => columns.map((col) => row[col]));
        return { columns, rows };
    } else {
        return { columns: ['Message'], rows: [['Incorect report result']] };
    }
}

export const getReportsLang = async (lang: string = 'uk'): Promise<Report[]> => {
    console.log('[getReportsLang] Fetching reports');
// curl -X GET "https://cnt.theweb.place/api/pcnt/v_perm_report/?app_id=mutant&report_id=5&lang=ua"
    const path = `v_perm_report/?app_id=${packageJson.name}&lang=${lang}`;
    const res = await axios.get<ReportDB[]>(path);
    return fromReportDB(res.data);
};

export const getReports = async (report_id?: number): Promise<Report[]> => {
    console.log('[getReports] Fetching reports with report_id:', report_id);
    const path = report_id === undefined ? 
    //   `perm_report/${packageJson.name}/` : 
      `perm_report/` : 
      `perm_report/${packageJson.name}/${report_id}/`;
    const res = await axios.get<ReportDB[]>(path);
    return fromReportDB(res.data);
};

export const createReport = async (report: Report): Promise<Report | null> => {
    console.log('[createReport] Creating report:', report);
    const rdb = toReportDB(report);
    const res = await axios.post<Report>(`perm_report/${packageJson.name}/`, rdb);
    return res.data;
}

export const updateReport = async (report: Report): Promise<Report> => {
    console.log('[updateReport] Updating report:', report);
    const rdb = toReportDB(report);
    const res = await axios.patch(`perm_report/${packageJson.name}/${rdb.report_id}/`);
    return res.data;
};

export const deleteReport = async (reportId: number): Promise<boolean> => {
    console.log('[deleteReport] Deleting report with ID:', reportId);
    const res = await axios.delete<IFetchResponse>(`perm_report/${packageJson.name}/${reportId}/`);
    return res.status === 200;
};

