import axios from 'axios';
import packageJson from '../../../package.json';
import { ReportExecutionResult } from "../../pages/Reports/ReportList";
import { IFetchResponse } from './fetchData';

export const executeReportQuery = async (
    id: number,
    params: { name: string; value: string | number | boolean }[]
): Promise<ReportExecutionResult> => {
    const paramsToSend = {
        app_id: packageJson.name,
        report_id: id,
        parameters: params,
    };
    console.log('[minireport] run report with params:', paramsToSend);
    const res0 = await axios.post<IFetchResponse>('https://cnt.theweb.place/api/report/', paramsToSend);
    const res: any = res0.data || {ok: false, data: []};
    if (res.ok) {
        console.log('[minireport] result:', res);
        const columns = Object.keys(res.data[0]);
        const rows = res.data.map((row: any) => columns.map((col) => row[col]));
        return { columns, rows };
    } else {
        return { columns: ['Message'], rows: [['Incorect report result']] };
    }
}
