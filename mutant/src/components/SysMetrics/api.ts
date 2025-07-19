import axios from 'axios';
import { Metric } from './types';

const API_URL = 'https://cnt.theweb.place/api/pcnt/v_metric_last';

export const api = {

    get: async (): Promise<Metric[]> => {
        const res = await axios.get<Metric[]>(API_URL);
        return res.data.filter((metric:any) => metric.dashboard_view);
   },

}