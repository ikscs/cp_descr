// src/api/pointApi.ts
import { fetchData, postData, getBackend, escapeSingleQuotes } from './fetchData';
import { selectData, insertData } from './genericApi';
// import { type ISelectParams } from './genericApiTypes'; // Not directly used in modified/added code, but may be used by other functions
import type { IFetchResponse, IPostResponse } from './fetchData';

/**
 * Створення, редагування, видалення поінта
 *
 * customer_id
 * point_id
 * name
 * country (берем из customer)
 * city (берем из customer)
 * time_period (по замовчуванню ‘day (face_time_slot/day)’) - клиенту не показываем
 * face_detection (1)  (method/face_detection is true)
 * embedding (1)  (method/embedding is true)
 * demography (3)  (method/demography is true)
 * expiration_time (3) (ораничить 24)
 */

// интерфейс для точки учета
export interface Point {
  customer_id: number;
  point_id: number; // Primary key
  name: string;
  country: string; // берем из customer
  city: string; // берем из customer
}

const POINT_TABLE_NAME = 'pcnt.point';

// use getPoints to get points for PointList / PointForm
const getPoints = async (customer_id: number): Promise<Point[]> => {

    try {
        const params = {
            from: 'pcnt.point',
            fields: 'customer_id,point_id,name,country,city',
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

// const fetchAllPoints = async (): Promise<Point[]> => {
//   console.log('[pointApi] fetchAllPoints called');
//   try {
//     const params: ISelectParams = {
//       from: 'pcnt.point', // Используем ту же таблицу, что и в getPoints
//       fields: 'customer_id, point_id, name', // Поля, соответствующие интерфейсу Point
//       order: 'customer_id, name', // Опциональная сортировка
//     };

//     // Используем selectData для получения данных
//     // selectData<Point> гарантирует, что результат будет Promise<Point[]>
//     const points: Point[] = await selectData<Point>(params);
//     console.log('[pointApi] fetchAllPoints received:', points.length, 'points');
//     return points;

//   } catch (err) {
//     // selectData уже логирует свои ошибки
//     // Этот блок catch для дополнительной обработки или логирования на этом уровне, если необходимо
//     console.error('Error in fetchAllPoints fetching points:', err);
//     return []; // Возвращаем пустой массив в случае ошибки, как в getPoints
//   }
// };

const qq = (s: string) => `''${s}''`

const createPoint = async (data: Partial<Omit<Point, 'point_id'>>): Promise<Point> => {
  console.log('[pointApi] createPoint called with data:', data);

  if (typeof data.customer_id !== 'number' || !data.name || typeof data.name !== 'string') {
    const errorMsg = 'customer_id (number) and name (string) are required to create a point.';
    console.error(`[pointApi] createPoint validation failed: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Prepare the data for insertion, ensuring all fields for Omit<Point, 'point_id'> are present
  // and conform to the Point interface (e.g., country/city as strings).
  const pointToInsert = [
    data.customer_id,
    qq(data.name),
    qq(data.country || ''),   // Default to empty string if undefined, as Point.country is string
    qq(data.city || ''),         // Default to empty string if undefined, as Point.city is string
];

  try {
    const result: IPostResponse & { error?: string } = await postData({
      backend_point: getBackend().backend_point_insert,
      dest: POINT_TABLE_NAME,
      fields: 'customer_id, name, country, city',
      values: [pointToInsert],
      returning: 'point_id, customer_id, name, country, city', // Request all fields for the complete Point object
    });

    if (result.ok && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const newPoint = result.data[0] as Point;
      // Validate if the returned object looks like a Point, especially point_id
      if (typeof newPoint.point_id !== 'number') {
        console.error('[pointApi] createPoint: Insert successful, but returned data is missing point_id or is not a valid point object:', newPoint);
        throw new Error('Failed to create point: Backend returned invalid data (missing point_id).');
      }
      console.log('[pointApi] createPoint successful, new point:', newPoint);
      return newPoint;
    } else if (result.ok && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
        // Handle cases where backend might return a single object directly (less common for INSERT...RETURNING)
        const newPoint = result.data as Point;
        if (typeof newPoint.point_id === 'number') {
            console.log('[pointApi] createPoint successful (single object returned), new point:', newPoint);
            return newPoint;
        } else {
            console.error('[pointApi] createPoint: Insert ok, but returned single object is not a valid point:', result.data);
            throw new Error('Failed to create point: Backend returned invalid single data object.');
        }
    } else {
      const errorMsg = result.error || (result.ok ? 'Insert reported success, but no valid data returned.' : 'Failed to create point.');
      console.error(`[pointApi] createPoint failed: ${errorMsg}`, result);
      throw new Error(errorMsg);
    }
  } catch (err: any) {
    console.error('[pointApi] Error during createPoint process:', err.message, err);
    throw err instanceof Error ? err : new Error(String(err.message || 'An unknown error occurred during point creation.'));
  }
};

const updatePoint = async (point_id: number, data: Partial<Omit<Point, 'point_id'>>): Promise<Point> => {
  console.log('[pointApi] updatePoint called for point_id:', point_id, 'with data:', data);

  if (Object.keys(data).length === 0) {
    console.warn('updatePoint: No data provided for update.');
    throw new Error('No data provided for point update.');
  }

  const backend = getBackend();
  const setClauses: string[] = [];
  const keys = Object.keys(data) as Array<keyof typeof data>;

  for (const key of keys) {
    const value = data[key];
    if (value === undefined) continue;

    if (typeof value === 'string') {
      setClauses.push(`${key} = ''${escapeSingleQuotes(value)}''`);
    } else if (typeof value === 'number') {
      setClauses.push(`${key} = ${value}`);
    } else if (value === null) {
      setClauses.push(`${key} = NULL`);
    } else {
      console.warn(`updatePoint: Unsupported type for key ${key}. Value: ${value}`);
      throw new Error(`Unsupported type for field ${key} in point update.`);
    }
  }

  if (setClauses.length === 0) {
    console.warn('updatePoint: No valid fields to update after processing data.');
    throw new Error('No valid fields to update for point.');
  }

  const updateQuery = `UPDATE ${POINT_TABLE_NAME} SET ${setClauses.join(', ')} WHERE point_id = ${point_id}`;

  try {
    console.log('[pointApi] updatePoint query:', updateQuery);
    const result = await postData({
      backend_point: backend.backend_point_query, // Using backend_point_query as per reportTools.ts example
      query: updateQuery,
    });

    if (result.ok) {
      const affectedRows = typeof result.data === 'number' ? result.data : -1; // Assuming result.data is affected rows count

      if (affectedRows > 0) {
        const updatedPoints = await selectData<Point>({
          from: POINT_TABLE_NAME,
          fields: 'customer_id, point_id, name',
          where: { point_id },
        });
        if (updatedPoints.length > 0) {
          return updatedPoints[0];
        }
        throw new Error(`CRITICAL: Point ${point_id} update reported success (${affectedRows} rows), but subsequent fetch failed.`);
      } else if (affectedRows === 0) {
        const existingPoint = await selectData<Point>({
          from: POINT_TABLE_NAME,
          fields: 'customer_id, point_id, name',
          where: { point_id },
        });
        if (existingPoint.length > 0) {
          return existingPoint[0]; // Point exists, data was identical
        }
        throw new Error(`Point with id ${point_id} not found (update affected 0 rows).`);
      } else {
        console.error(`Update for point ${point_id} was OK, but 'result.data' was not a valid affected rows count:`, result.data);
        throw new Error(`Update for point ${point_id} completed with ambiguous result from backend.`);
      }
    } else {
      const errorMsg = (result as any).error || 'Unknown backend error during update.';
      console.error(`Update for point_id ${point_id} failed. Error: ${errorMsg}`, result);
      throw new Error(`Failed to update point ${point_id}: ${errorMsg}`);
    }
  } catch (err) {
    console.error(`Error during update process for point ${point_id}:`, err);
    throw err; // Re-throw original error or a new one if it's not an Error instance
  }
};

const deletePoint = async (point_id: number): Promise<void> => {
  console.log('[pointApi-Mock] deletePoint called for point_id:', point_id);
  const deleteQuery = `DELETE FROM ${POINT_TABLE_NAME} WHERE point_id = ${point_id}`;
  const backend = getBackend();
  try {
    const result = await postData({
      backend_point: backend.backend_point_query,
      query: deleteQuery,
    });
    if (result.ok) {
      const affectedRows = typeof result.data === 'number' ? result.data : -1; // Assuming result.data is affected rows count
      if (affectedRows > 0) {
        console.log(`Point with id ${point_id} deleted successfully.`);
      } else {
        console.warn(`No point found with id ${point_id} to delete.`);
      }
    } else {
      const errorMsg = (result as any).error || 'Unknown backend error during delete.';
      console.error(`Delete for point_id ${point_id} failed. Error: ${errorMsg}`, result);
      throw new Error(`Failed to delete point ${point_id}: ${errorMsg}`);
    }
  } catch (err) {
    console.error(`Error during delete process for point ${point_id}:`, err);
    throw err;
  }
};

export const pointApi = {
  getPoints,
  // fetchAllPoints,
  createPoint,
  updatePoint,
  deletePoint,
};