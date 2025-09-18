import { fetchData, getBackend, postData, type IFetchResponse, } from './fetchData';
import { type CustomerPoint } from '../../context/CustomerContext';
import axios from 'axios';
// import { mode, tenantId } from '../../globals_VITE';
import { basename } from "../../globals_VITE";

export interface Customer {
  customer_id: number; // Primary key
  legal_name: string;
  address: string;
  country: string;
  city: string;
}

export const getPointsDrf = async (): Promise<CustomerPoint[]> => {
    console.log('[getPointsDrf] called');
    const res = await axios.get<CustomerPoint[]>('point/');
    return res.data;
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

export const getCustomer = async (customer_id: number): Promise<Customer[]> => {
    console.log('[getCustomer] customer_id:', customer_id);
    const res = await axios.get<Customer>(`customer/${customer_id}/`);
    return [res.data];
};

// use getCustomer to get customer for point's initial values (country, city)
export const _getCustomer = async (customer_id: number): Promise<Customer[]> => {
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

export const registerCustomer = async (data: Customer, _userId: number, email: string ): Promise<Customer | null> => {
    console.log('[registerCustomer] ', data);
    console.log('basename', basename);
    // const res = await axios.post(basename+'https://cnt.theweb.place/api/register_customer/', {
    const res = await axios.post(basename+'/api/register_customer/', {
        legal_name: data.legal_name,
        address: data.address, 
        country: data.country, 
        city: data.city, 
        email: email,
    });
    return res.data;
}

export const _postCustomer = async (data: Customer): Promise<Customer | null> => {
    
    const insertQuery = 
        `insert into public.customer(legal_name, address, country, city)
        values (
            ''${data.legal_name}'',
            ''${data.address}'',
            ''${data.country}'',
            ''${data.city}'') returning customer_id, legal_name, address, country, city`;

    const backend = getBackend();
    console.log('[postCustomer] insertQuery:', insertQuery);
    const result = await postData({
        backend_point: backend.backend_point_query,
        query: insertQuery,
    });

    if (result.ok) {
        return result.data[0] as Customer;
    } else {
        console.error('Error inserting customer:', result.data);
        return null;
    }

}

// export const postCustomer = async (data: Partial<Omit<Customer, 'customer_id'>>): Promise<Customer | null> => {
export const postCustomer_ = async (data: Customer): Promise<Customer | null> => {
    const { customer_id, ...dataToSend } = data;
    // const dataToSend:any = data;
    // dataToSend.customer_id = null;
    console.log('[postCustomer] ', dataToSend);
    const res = await axios.post<Customer>('customer/', dataToSend);
    return res.data;
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

// curl -X GET https://cnt.theweb.place/api/pcnt/user_cache/?user_id=3^&tenant_id=qbj5q6rn^&mode=live
export const updateUserCache = async (
    customer_id: number,
    user_id: number,
    tenant_id: string,
    mode: string,
): Promise<boolean> => {
    const res1 = await axios.get(`user_cache/?user_id=${user_id}&tenant_id=${tenant_id}&mode=${mode}`);
    if (res1.status !== 200 || res1.data.length === 0) {
        return false;
    }
    const id = res1.data[0].id;
    const res2 = await axios.patch(`user_cache/${id}/`, { customer_id }); 
    return res2.status === 200;
}