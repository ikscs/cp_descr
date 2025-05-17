import { fetchData, type IFetchResponse, } from './fetchData';
import { type CustomerPoint } from '../../context/CustomerContext';

export const getPoints = async (customer_id: number): Promise<CustomerPoint[]> => {
    
    try {
        const params = {
            from: 'pcnt.point',
            fields: 'point_id AS value, name AS label', 
            order: 'name',
            where: { customer_id },
        };

        const response: IFetchResponse = (await fetchData(params));
        console.log('[getPoints] response:', response);
        return response;

    } catch (err) {
        console.error('Error fetching customer\'s points:', err);
        return [];
    }
};
