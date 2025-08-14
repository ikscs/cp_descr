// mapFromDB: из "сырых" данных (snake_case) в интерфейс TS (camelCase)
export function mapFromDB<T>(
  raw: Record<string, any>,
  keyMap: Record<keyof T, string>
): T {
  const result = {} as T;
  for (const camelKey in keyMap) {
    const snakeKey = keyMap[camelKey as keyof T];
    result[camelKey as keyof T] = raw[snakeKey];
  }
  return result;
}

// mapToDB: из TS-интерфейса (camelCase) в "сырые" данные (snake_case)
export function mapToDB<T>(
  obj: T,
  keyMap: Record<keyof T, string>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const camelKey in keyMap) {
    const snakeKey = keyMap[camelKey as keyof T];
    result[snakeKey] = obj[camelKey as keyof T];
  }
  return result;
}

/* 
Пример использования

interface User {
  userId: number;
  userName: string;
  createdAt: string;
}

const userKeyMap: Record<keyof User, string> = {
  userId: "user_id",
  userName: "user_name",
  createdAt: "created_at",
};

const rawDB = {
  user_id: 1,
  user_name: "Alice",
  created_at: "2025-08-13T10:00:00Z",
};

const user: User = mapFromDB<User>(rawDB, userKeyMap);
console.log(user);

const rawDBBack = mapToDB(user, userKeyMap);
console.log(rawDBBack);

*/