import axios, { AxiosError } from 'axios';

// Ответ для функции получения списка (таблицы)
interface FetchTableResponse<T> {
  data: T[] | null;
  error: string | null;
  // loading: boolean; // loading обычно управляется вызывающим компонентом для fetchTable
}

// Обобщенный ответ для операций создания, обновления, удаления
interface MutationResponse<R> {
  data: R | null; // Данные, возвращаемые сервером после операции
  error: string | null;
}

/**
 * Обобщенная функция для получения массива данных (например, для таблицы).
 * @param url URL для GET-запроса.
 * @returns Promise с объектом, содержащим данные или ошибку.
 */
export async function fetchTable<T>(url: string): Promise<FetchTableResponse<T>> {
  try {
    const response = await axios.get<T[]>(url);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Произошла непредвиденная ошибка при загрузке данных';
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      errorMessage = axiosError.message;
      if (axiosError.response) {
        console.error("Server Error (GET):", axiosError.response.data);
        // Можно добавить более детальную информацию, например:
        // errorMessage += ` (Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)})`;
      }
    }
    console.error(`Ошибка при загрузке данных с ${url}:`, err);
    return { data: null, error: errorMessage };
  }
}

/**
 * Обобщенная функция для отправки POST-запроса.
 * @param url URL для POST-запроса.
 * @param data Данные для отправки.
 * @returns Promise с объектом, содержащим ответ сервера или ошибку.
 */
export async function postData<T_Request, T_Response = T_Request>(
  url: string,
  data: T_Request
): Promise<MutationResponse<T_Response>> {
  try {
    const response = await axios.post<T_Response>(url, data);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Произошла ошибка при отправке POST-запроса';
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      errorMessage = axiosError.message;
      if (axiosError.response) {
        console.error("Server Error (POST):", axiosError.response.data);
        // errorMessage += ` (Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)})`;
      }
    }
    console.error(`Ошибка при POST-запросе на ${url}:`, err);
    return { data: null, error: errorMessage };
  }
}

/**
 * Обобщенная функция для отправки PUT-запроса.
 * @param url URL для PUT-запроса (обычно включает ID обновляемого ресурса).
 * @param data Данные для обновления.
 * @returns Promise с объектом, содержащим ответ сервера или ошибку.
 */
export async function updateData<T_Request, T_Response = T_Request>(
  url: string,
  data: T_Request
): Promise<MutationResponse<T_Response>> {
  try {
    const response = await axios.put<T_Response>(url, data);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Произошла ошибка при отправке PUT-запроса';
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      errorMessage = axiosError.message;
      if (axiosError.response) {
        console.error("Server Error (PUT):", axiosError.response.data);
        // errorMessage += ` (Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)})`;
      }
    }
    console.error(`Ошибка при PUT-запросе на ${url}:`, err);
    return { data: null, error: errorMessage };
  }
}

/**
 * Обобщенная функция для отправки DELETE-запроса.
 * @param url URL для DELETE-запроса (обычно включает ID удаляемого ресурса).
 * @returns Promise с объектом, содержащим ответ сервера (часто пустой) или ошибку.
 */
export async function deleteData<T_Response = null>( // T_Response по умолчанию null, т.к. DELETE часто возвращает 204 No Content
  url: string
): Promise<MutationResponse<T_Response>> {
  try {
    const response = await axios.delete<T_Response>(url);
    return { data: response.data, error: null };
  } catch (err) {
    let errorMessage = 'Произошла ошибка при отправке DELETE-запроса';
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      errorMessage = axiosError.message;
      if (axiosError.response) {
        console.error("Server Error (DELETE):", axiosError.response.data);
        // errorMessage += ` (Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)})`;
      }
    }
    console.error(`Ошибка при DELETE-запросе на ${url}:`, err);
    return { data: null, error: errorMessage };
  }
}
