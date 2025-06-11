import axios from "axios";
import { SysParam } from "./SysParamsTypes";
import { fetchData, IFetchResponse, } from "../../api/data/fetchData";

const API_URL = 'https://cnt.theweb.place/api/pcnt/param'; // Замените на ваш реальный URL API

// Получить параметры
export async function getParams(): Promise<SysParam[]> {
  const res = await axios.get<SysParam[]>(API_URL);
  return res.data;
}

// Обновить параметр
export async function updateParam(id: number, data: { value: { value: any } }): Promise<void> {
  // Если ваш API поддерживает PATCH, используйте его для частичного обновления
  // Если ваш API требует PUT для обновления, раскомментируйте следующую строку и закомментируйте строку с PATCH
  // await axios.put(`${API_URL}/${id}/`, data, {
  await axios.patch(`${API_URL}/${id}/`, data, {
    headers: {
      "Content-Type": "application/json",
      // 'authorization': `Bearer ${apiToken.token}`,
    },
  });
}

// Получить параметры - альтернативный метод с использованием fetchData
export async function getParams1(): Promise<SysParam[]> {
    const params = {
        from: 'pcnt.param',
        order: 'name',
    };
    const response: IFetchResponse = (await fetchData(params));
    console.log('[getParams1] response:', response);
    return response;
};

// Обновить параметр - альтернативный метод с использованием fetch api
export async function updateParam1(id: number, data: { value: { value: any } }): Promise<void> {
    const params: any = {
        from: 'pcnt.param',
        where: `id = ${id}`,
        data: {
            value: data.value.value,
        },  
      }
    const response: IFetchResponse = (await fetchData(params));
    console.log('[updateParam1] response:', response);   
}
