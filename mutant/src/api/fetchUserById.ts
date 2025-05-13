import { type User } from './fetchUsers'; // Импортируем основной тип User

// Можно использовать тот же тип User, если API возвращает ту же структуру
// Или создать отдельный тип, если структура ответа отличается

/**
 * Запрашивает данные конкретного пользователя по его ID.
 *
 * @param tenantId - ID тенанта, к которому принадлежит пользователь.
 * @param apiKey - API ключ для аутентификации.
 * @param userId - Числовой ID пользователя, данные которого нужно получить.
 * @returns Promise, который разрешается данными пользователя.
 * @throws Ошибка, если запрос не удался или ответ не 'ok'.
 */
export const fetchUserById = async (
    tenantId: string,
    apiKey: string,
    userId: number // Используем числовой userId
): Promise<User> => {
    const response = await fetch(
        `https://api.userfront.com/v0/tenants/${tenantId}/users/${userId}`, // Эндпоинт для одного юзера
        {
            method: 'GET', // Метод GET для получения данных
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error("Userfront error fetching user by ID:", errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
    }

    const userData: User = await response.json();
    return userData;
};