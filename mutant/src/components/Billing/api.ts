import axios from "axios"
import packageJson from '../../../package.json';
// import { create } from "domain";

export interface Balance {
    value: number;
    crn: string;
    startDate?: Date;
    endDate?: Date;
}

export interface BasePrice {
    crn: string;
    value: number;
}

export interface CameraCatg {
    type: string;
    coeff: number;
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
// const createOrder = async (orderId: string, amount: number, currency: string, description: string, param: any): Promise<any> => {
const createOrder = async (amount: number, currency: string, description: string, param: any): Promise<any> => {
    try {
        const res = await axios.post('https://cnt.theweb.place/api/billing/create_liqpay_order/', {
            // order_id: orderId,
            amount,
            currency,
            description,
            param,
            app_id: packageJson.name,
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

const getBasePrice = async (): Promise<BasePrice[]> => {
    const res = await axios.get('https://cnt.theweb.place/api/billing/subscription_base_price/');
    return res.data ? res.data : [];
}

const getCameraCatg = async (): Promise<CameraCatg[]> => {
    const res = await axios.get('https://cnt.theweb.place/api/billing/camera_catg/');
    return res.data ? res.data : [];
}

export const api = {
    getBalance,
    createOrder,
    getOrderStatus,
    getBasePrice,
    getCameraCatg,
}