import { fetchData, getBackend, postData, type IFetchResponse, } from './fetchData';
import { type CustomerPoint } from '../../context/CustomerContext';

export interface Customer {
  customer_id: number; // Primary key
  legal_name: string;
  address: string;
  country: string;
  city: string;
}

// use getPoints to get points for customer suitable for select
export const getPoints = async (customer_id: number): Promise<CustomerPoint[]> => {
    
    try {
        const params = {
            from: 'pcnt.point',
            // fields: 'point_id AS value, name AS label', 
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

// use getCustomer to get customer for point's initial values (country, city)
export const getCustomer = async (customer_id: number): Promise<Customer[]> => {
    try {
        const params = {
            from: 'public.customer',
            fields: 'customer_id,legal_name,address,country,city',
            // fields: 'country,city',
            where: { customer_id },
        };
        console.log('[getCustomer] params:', params);

        const response: IFetchResponse = (await fetchData(params));
        console.log('[getCustomer] response:', response);
        return response;

    } catch (err) {
        console.error('Error fetching customers:', err);
        return [];
    }
}

export const putCustomer = async (customer: Customer): Promise<Customer | null> => {

    const updateQuery = 
        `UPDATE public.customer SET 
        address=''${customer.address}'',
        country=''${customer.country}'',
        city=''${customer.city}''
        WHERE customer_id = ${customer.customer_id}`;

    try {
        const backend = getBackend();
        console.log('[putCustomer] update query:', updateQuery);
        const result = await postData({
            backend_point: backend.backend_point_query,
            query: updateQuery,
        });

        if (result.ok) {
            return customer;
        } else {
            console.error('Error updating customer:', result.data);
            return null;
        }
    } catch (err) {
        console.error('Error updating customer:', err);
        return null;
    }
}
