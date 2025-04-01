// src/api/data/reportTools.ts
import { backend, fetchData, IFetchResponse, postData } from './fetchData';
import packageJson from '../../../package.json';
import { getCount, getMax } from './dataTools';
import { Parameter } from '../../pages/Reports/QueryParam';
import { string } from 'yup';

export interface Report {
  id: number;
  name: string;
  description: string;
  params: Parameter[];
  // config?: Object,
  config?: string,
  query: string;
}

const REPORT_TABLE = 'cp3.perm_report'; 

export const getReports = async (): Promise<Report[]> => {
  try {
    const params = {
      from: REPORT_TABLE,
      fields: 'report_id, report_name, report_description, query, report_config', 
      order: 'report_name',
      where: {app_id: packageJson.name},
    };
    const response: IFetchResponse = (await fetchData(params));
    const stringToParams = (config: string): Parameter[] => {
      try {
        const parsedConfig = JSON.parse(config);
        return parsedConfig.map((param: any) => ({
          name: param.name,
          type: param.type,
          value: param.value,
          required: param.required || false,
          options: param.options || [],
        }));
      }
      catch (error) {
        console.error('Error parsing report config:', error);
        return [];
      }
    }
    return response.map((row: any) => ({
        id: row.report_id,
        name: row.report_name,
        description: row.report_description,
        config: row.report_config,
        query: row.query,
        params: stringToParams(row.report_config),
    }));
  } catch (err) {
    console.error('Error fetching initial reports:', err);
    return [];
  }
};

const qq = (s: string) => `''${s}''`

export const createReport = async (report: Report): Promise<Report | null> => {
  try {
    const _max = await getMax({
        field: 'report_id',
        from: 'cp3.perm_report',
        where: {app_id: packageJson.name}
    })
    report.id = _max + 1;

    const postParam = {
        backend_point: backend.backend_point_insert,
        dest: 'cp3.perm_report',
        fields: 'app_id,report_id,report_name,report_description,query,report_config',
        values: [[qq(packageJson.name), report.id, qq(report.name), qq(report.description), qq(report.query), qq(report.config||'')]]
    }
    
    console.log(postParam)
    const result = await postData(postParam)
    return result.data > 0 ? report : null;
  } catch (err) {
    console.error('Error creating report:', err);
    return null;
  }
};

const _updateReport = async (report: Report): Promise<Report | null> => {
  try {
    const params = {
        backend_point: backend.backend_point_update,
        dest: 'cp3.perm_report',
        fields: 'report_name,report_description,query',
        set: {
            report_name: qq(report.name),
            report_description: qq(report.description),
            query: qq(report.query),
            config: qq(report.config||''),
        },
        where: {report_id: report.id, app_id: packageJson.name},
    };
    const result = await postData(params);
    return result.data > 0 ? report : null;
  } catch (err) {
    console.error('Error updating report:', err);
    return null;
  }
};

export const updateReport = async (report: Report): Promise<Report | null> => {
    try {
        const updateQuery = 
        `UPDATE cp3.perm_report SET 
            report_name = ''${report.name}'', 
            report_description = ''${report.description}'',
            query = ''${report.query}'',
            report_config = ''${report.config||''}''
        WHERE app_id = ''${packageJson.name}'' AND report_id = ${report.id};`

        const result = await postData({
            backend_point: backend.backend_point_query,
            query: updateQuery, 
        })
    
        return result.data > 0 ? report : null;
    } catch (err) {
      console.error('Error updating report:', err);
      return null;
    }
  };
  
  
export const deleteReport = async (reportId: number): Promise<boolean> => {
  try {
    const deleteQuery = 
        `DELETE FROM cp3.perm_report WHERE app_id = ''${packageJson.name}'' AND report_id = ${reportId};`
    const result = await postData({
        backend_point: backend.backend_point_query,
        query: deleteQuery, 
    })
    return result.ok && result.data == 1;
  } catch (err) {
    console.error('Error deleting report:', err);
    return false;
  }
};
