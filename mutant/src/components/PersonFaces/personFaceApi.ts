import axios from 'axios';
import { apiToken, fetchData, getBackend, IFetchResponse, IPostResponse, postData } from '../../api/data/fetchData';
import { PersonFace } from './personFace.types';
import { basename } from '../../globals_VITE';

// Утилита для преобразования Base64 строки в Uint8Array для браузера
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64); // Декодируем Base64 в бинарную строку
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Утилита для преобразования Uint8Array в Data URL для img src
// Эта функция уже была корректна
// export const uint8ArrayToBase64_ = (array: Uint8Array): string => {
//   const blob = new Blob([array], { type: 'image/png' }); // или 'image/jpeg' в зависимости от вашего формата
//   return URL.createObjectURL(blob);
// };

export const uint8ArrayToBase64_ = (array: Uint8Array): string => {
  const blob = new Blob([array as BlobPart], { type: 'image/png' });
  return URL.createObjectURL(blob);
};


// Прозрачный GIF 1x1 пиксель в Base64
// const transparentGifBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Пример данных (используем новую утилиту для фото)
// const mockFaces: PersonFace[] = [
//   {
//     faceUuid: 'face-1',
//     personId: 10,
//     photo: base64ToUint8Array(transparentGifBase64),
//     comment: 'Улыбка',
//     embedding: [0.1, 0.2, 0.3],
//   },
//   {
//     faceUuid: 'face-2',
//     personId: 10,
//     photo: base64ToUint8Array(transparentGifBase64),
//     comment: 'Серьезное лицо',
//     embedding: [0.4, 0.5, 0.6],
//   },
//   {
//     faceUuid: 'face-3',
//     personId: 2,
//     photo: base64ToUint8Array(transparentGifBase64),
//     comment: 'Задумчивый взгляд',
//     embedding: [0.7, 0.8, 0.9],
//   },
// ];

// Имитация задержки API
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
// export const mockApi = {
//   getFacesByPersonId: async (personId: number): Promise<PersonFace[]> => {
//     await delay(500); // Имитация задержки сети
//     return mockFaces.filter(face => face.personId === personId);
//   },

//   addFace: async (newFace: Omit<PersonFace, 'faceUuid'>): Promise<PersonFace> => {
//     await delay(300);
//     const createdFace: PersonFace = {
//       ...newFace,
//       faceUuid: `face-${Math.random().toString(36).substring(2, 9)}`, // Генерация уникального ID
//     };
//     mockFaces.push(createdFace);
//     return createdFace;
//   },

//   deleteFaces: async (faceUuids: string[]): Promise<void> => {
//     await delay(300);
//     for (const uuid of faceUuids) {
//       const index = mockFaces.findIndex(face => face.faceUuid === uuid);
//       if (index > -1) {
//         mockFaces.splice(index, 1);
//       }
//     }
//   },
// };

const API_URL = 'https://cnt.theweb.place/api/pcnt/face_referer_data';
// const API_URL = '/face_referer_data';

export const uint8ArrayToBase64 = (array: Uint8Array): string => {
  const binaryString = String.fromCharCode(...array);
  return btoa(binaryString);
}

// const uint8ArrayToBlob = (uint8Array: Uint8Array, type: string = 'image/png'): Blob => {
//   return new Blob([uint8Array], { type: type });
// };

// const base64ToUint8Array = (base64: string): Uint8Array =>{
//   // Декодируем Base64 строку в "бинарную" строку с помощью atob()
//   // atob() работает только в браузерных окружениях и не поддерживает URL-safe Base64 напрямую
//   const binaryString = atob(base64);

//   // Создаем Uint8Array нужного размера
//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);

//   // Итерируем по бинарной строке и записываем коды символов в Uint8Array
//   for (let i = 0; i < len; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }

//   return bytes;
// };

// const API_URL_FACES = 'https://cnt.theweb.place/api/pcnt/faces';

export const api = {

  getFacesByPersonId: async (personId: number): Promise<PersonFace[]> => {
  console.log(`[api getFacesByPersonId] getFacesByPersonId called for personId: ${personId}`);
  try {
    const params = {
      from: 'pcnt.face_referer_data',
      where: { person_id: personId },
    };
    const response: IFetchResponse = await fetchData(params);
    console.log(`[api getFacesByPersonId] response for personId ${personId}:`, response);

    if (Array.isArray(response)) {
      // return response as PersonFace[];
        return response.map(item => {
          // Check if photo exists and is an object (which your example implies)
          // and if it's not null.
          if (item.photo && typeof item.photo === 'object' && !Array.isArray(item.photo)) {
            // Extract values from the object and create a Uint8Array
            const photoValues = Object.values(item.photo) as number[];
            return {
              ...item,
              photo: new Uint8Array(photoValues),
              faceUuid: item.face_uuid,
            } as PersonFace;
          }
          // If photo is not an object or is already an array, return item as is
          return item as PersonFace;
        });    
    }
      console.warn(`[api getFacesByPersonId] Expected array but received:`, response);
      return [];
    } catch (err) {
      console.error(`[api getFacesByPersonId] Error fetching origins for personId ${personId}:`, err);
      return [];
    }
  },

  get: async (personId: number): Promise<PersonFace[]> => {
    const res = await axios.get<PersonFace[]>(`${API_URL}/person/${personId}`, { // API_URL_FACES
    // const res = await axios.get<PersonFace[]>(API_URL, {
        headers: {
          "Content-Type": "application/json",
          'authorization': `Bearer ${apiToken.token}`,
        }
      });
    // console.log('res.data:', JSON.stringify(res.data[43])); // base64 проверка
    return res.data
      // .filter((face:any) => face.person === personId) // todo: преобразоввать наименования
      .map((face:any) => ({
        ...face,
        faceUuid: face.face_uuid, // todo: преобразоввать наименования
        personId: face.person_id,
        photo: base64ToUint8Array(face.photo),
      })) as PersonFace[];
   },

  // addFormData: async (data: FormData): Promise<FormData> => {
  //   await axios.post(`${API_URL}/`, data, {
  //     headers: {
  //       "Content-Type": "application/json",
  //       'authorization': `Bearer ${apiToken.token}`,
  //     },
  //   });
  //   return data;
  // },

  add: async (data: PersonFace): Promise<PersonFace> => {
    const dataToInsert = {
      face_uuid: data.faceUuid,
      person_id: data.personId,
      photo: uint8ArrayToBase64(data.photo),
      comment: data.comment,
    };
    await axios.post(`${API_URL}/`, dataToInsert, {
      headers: {
        "Content-Type": "application/json",
        'authorization': `Bearer ${apiToken.token}`,
      },
    });
    return data;
  },

  addFace: async (newFace: Omit<PersonFace, 'faceUuid'>): Promise<PersonFace> => {
    console.log('[api addFace] addFace called with data:', newFace);
    if (!newFace.personId || !newFace.photo || !newFace.comment ) {
      const errorMsg = 'personId, photo, comment, and embedding are required to add a face.';
      console.error(`[api addFace] validation failed: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    const faceToInsert = {
      face_uuid: window.crypto.randomUUID(),
      person_id: newFace.personId,
      photo: newFace.photo,
      comment: newFace.comment,
    };
    try {
        const result: IPostResponse & { error?: string } = await postData({
          backend_point: getBackend().backend_point_insert,
          dest: 'pcnt.face_referer_data',
          fields: 'face_uuid, person_id, photo, comment',
          values: [faceToInsert],
          returning: 'face_uuid, person_id, photo, comment',
        });

      if (result.ok && result.data && Array.isArray(result.data) && result.data.length > 0) {
        const createdFace = result.data[0] as PersonFace;
        return createdFace;
      } else {
        throw new Error('Failed to create face');
      }
    } catch (err) {
      console.error('[api addFace] Error adding face:', err);
      throw err;
    }
  },

  // deleteFaces: mockApi.deleteFaces,
  deleteFaces: async (faceUuids: string[]): Promise<void> => {
    for (const uuid of faceUuids) {
      await axios.delete(`${API_URL}/${uuid}/`, {
        headers: {
          "Content-Type": "application/json",
          'authorization': `Bearer ${apiToken.token}`,
        },
      });
    }
  },

  patchSortord: async (faceUuid: string, sortord: number): Promise<void> => {
    await axios.patch(`${API_URL}/${faceUuid}/`, {sortord});
  },
}