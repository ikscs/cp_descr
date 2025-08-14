import axios from "axios"
import { create } from "domain";

export interface Balance {
    value: number;
    crn: string;
    startDate?: Date;
    endDate?: Date;
}

const balanceKeyMap: Record<keyof Balance, string> = {
    value: "value",
    crn: "crn",
    startDate: "start_date",
    endDate: "end_date",
};

const getBalance = async (): Promise<Balance | null> => {
    const res = await axios.get('https://cnt.theweb.place/api/billing/balance/');
    if (res.data && res.data.length > 0) {
        return {
            value: res.data[0].value,
            crn: res.data[0].crn,
            startDate: new Date(res.data[0].start_date),
            endDate: new Date(res.data[0].end_date),
        };
    } else {
        return null;
    }
}

// todo: replace any by Order
const createOrder = async (orderId: string, amount: number, currency: string, description: string): Promise<any> => {
    try {
        const res = await axios.post('https://cnt.theweb.place/api/billing/test_order/', {
            order_id: orderId,
            amount: amount,
            currency: currency,
            description: description,
        });
        return res.data ? res.data : null;
    } catch {
        return null;
    }
}

const getOrderStatus = async (orderId: string): Promise<any> => {
    try {
        const res = await axios.get(`https://cnt.theweb.place/api/billing/pay_status/?order_id=${orderId}`);
        return res.data ? res.data : null;
    } catch {
        return null;
    }
}

export const api = {
    getBalance,
    createOrder,
    getOrderStatus,
}