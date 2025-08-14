type DBFieldType = "string" | "number" | "boolean" | "date";

interface Balance {
  value: number;
  crn: string;
  startDate: Date;
  endDate: Date;
}

type KeyMap<T> = {
  [K in keyof T]: { dbKey: string; type: DBFieldType };
};

const balanceKeyMap: KeyMap<Balance> = {
  value: { dbKey: "value", type: "number" },
  crn: { dbKey: "crn", type: "string" },
  startDate: { dbKey: "start_date", type: "date" },
  endDate: { dbKey: "end_date", type: "date" },
};

function parseValue(value: any, type: DBFieldType): any {
  switch (type) {
    case "number":
      return typeof value === "number" ? value : Number(value);
    case "boolean":
      return Boolean(value);
    case "date":
      return value instanceof Date ? value : new Date(value);
    case "string":
    default:
      return String(value);
  }
}

function serializeValue(value: any, type: DBFieldType): any {
  switch (type) {
    case "date":
      return value instanceof Date ? value.toISOString() : value;
    default:
      return value;
  }
}

function mapFromDB<T>(raw: Record<string, any>, keyMap: KeyMap<T>): T {
  const result = {} as T;
  for (const key in keyMap) {
    const { dbKey, type } = keyMap[key as keyof T];
    result[key as keyof T] = parseValue(raw[dbKey], type);
  }
  return result;
}

function mapToDB<T>(obj: T, keyMap: KeyMap<T>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in keyMap) {
    const { dbKey, type } = keyMap[key as keyof T];
    result[dbKey] = serializeValue(obj[key as keyof T], type);
  }
  return result;
}
/*
Пример использования

const rawDB = {
  value: "123.45",
  crn: "USD",
  start_date: "2025-08-13T00:00:00Z",
  end_date: "2025-09-13T00:00:00Z",
};

const balance = mapFromDB<Balance>(rawDB, balanceKeyMap);
console.log(balance);
// balance.value будет number 123.45
// balance.startDate будет Date объект

const rawDBBack = mapToDB(balance, balanceKeyMap);
console.log(rawDBBack);
// Даты превратятся в ISO строки

*/