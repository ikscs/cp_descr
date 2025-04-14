// src/services/api.ts
import {
    Department,
    Position,
    Employee,
    PaginatedData,
    GridFilterModel,
    GridSortModel,
    SimpleListItem
} from '../types/models';

// --- Mock Data (Удалить в реальном приложении) ---
let mockDepartments: Department[] = [
    { department_id: 1, department_name: 'Отдел разработки', description: 'Занимается разработкой программного обеспечения' },
    { department_id: 2, department_name: 'Отдел маркетинга', description: 'Отвечает за продвижение и рекламу' },
    { department_id: 3, department_name: 'Отдел продаж', description: 'Занимается продажей товаров и услуг' },
    { department_id: 4, department_name: 'Отдел кадров', description: 'Управление персоналом и найм' },
];
let mockPositions: Position[] = [
    { position_id: 1, position_name: 'Руководитель отдела', description: 'Управляет работой отдела' },
    { position_id: 2, position_name: 'Ведущий разработчик', description: 'Разрабатывает ключевые компоненты системы' },
    { position_id: 3, position_name: 'Младший разработчик', description: 'Участвует в разработке под руководством' },
    { position_id: 4, position_name: 'Маркетолог', description: 'Разрабатывает и реализует маркетинговые стратегии' },
    { position_id: 5, position_name: 'Менеджер по продажам', description: 'Ведет переговоры с клиентами и заключает сделки' },
    { position_id: 6, position_name: 'Специалист по кадрам', description: 'Занимается подбором и адаптацией персонала' },
];
let mockEmployees: Employee[] = [
    { employee_id: 1, first_name: 'Иван', last_name: 'Иванов', middle_name: 'Петрович', email: 'ivan.ivanov@example.com', phone_number: '+380501234567', hire_date: '2023-01-15', department_id: 1, position_id: 1, manager_id: null, salary: 100000.00 },
    { employee_id: 2, first_name: 'Петр', last_name: 'Петров', middle_name: 'Сергеевич', email: 'petr.petrov@example.com', phone_number: '+380679876543', hire_date: '2023-03-10', department_id: 1, position_id: 2, manager_id: 1, salary: 80000.00 },
    { employee_id: 3, first_name: 'Анна', last_name: 'Сидорова', middle_name: 'Алексеевна', email: 'anna.sidorova@example.com', phone_number: '+380931122334', hire_date: '2023-05-20', department_id: 1, position_id: 3, manager_id: 2, salary: 60000.00 },
    { employee_id: 4, first_name: 'Елена', last_name: 'Козлова', middle_name: 'Викторовна', email: 'elena.kozlova@example.com', phone_number: '+380995554433', hire_date: '2023-02-01', department_id: 2, position_id: 4, manager_id: 1, salary: 75000.00 },
    { employee_id: 5, first_name: 'Дмитрий', last_name: 'Смирнов', middle_name: 'Андреевич', email: 'dmitry.smirnov@example.com', phone_number: '+380632223344', hire_date: '2023-04-12', department_id: 3, position_id: 5, manager_id: 1, salary: 90000.00 },
    { employee_id: 6, first_name: 'Ольга', last_name: 'Новикова', middle_name: 'Ивановна', email: 'olga.novikova@example.com', phone_number: '+380957778899', hire_date: '2023-06-25', department_id: 4, position_id: 6, manager_id: 1, salary: 70000.00 },
    { employee_id: 7, first_name: 'Сергей', last_name: 'Морозов', middle_name: null, email: 'sergey.morozov@example.com', phone_number: '+380661112233', hire_date: '2023-07-01', department_id: 1, position_id: 2, manager_id: 1, salary: 85000.00 },
];
let nextDeptId = 5;
let nextPosId = 7;
let nextEmpId = 8;
// --- End Mock Data ---

const applyPagination = <T>(items: T[], page: number, pageSize: number): T[] => {
    return items.slice(page * pageSize, (page + 1) * pageSize);
};

// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Department API ---

export const fetchDepartments = async (
    page: number,
    pageSize: number,
    filterModel?: GridFilterModel,
    sortModel?: GridSortModel
): Promise<PaginatedData<Department>> => {
    await delay(300);
    console.log("Fetching Departments:", { page, pageSize, filterModel, sortModel });
    // TODO: Добавить логику фильтрации и сортировки на основе filterModel и sortModel
    let filteredItems = [...mockDepartments]; // Копируем, чтобы не изменять оригинал
    // Пример простой фильтрации по имени (в реальном API это будет сложнее)
    if (filterModel?.items?.length) {
        const nameFilter = filterModel.items.find(f => f.field === 'department_name');
        if (nameFilter?.value) {
            filteredItems = filteredItems.filter(d =>
                d.department_name.toLowerCase().includes(String(nameFilter.value).toLowerCase())
            );
        }
    }
    // Пример простой сортировки по имени
    if (sortModel?.length) {
        const sort = sortModel[0];
        if (sort.field === 'department_name') {
            filteredItems.sort((a, b) => {
                const compare = a.department_name.localeCompare(b.department_name);
                return sort.sort === 'desc' ? -compare : compare;
            });
        }
    }

    const total = filteredItems.length;
    const items = applyPagination(filteredItems, page, pageSize);
    return { items, total };
};

export const addDepartment = async (department: Omit<Department, 'department_id'>): Promise<Department> => {
    await delay(200);
    const newDepartment: Department = { ...department, department_id: nextDeptId++ };
    mockDepartments.push(newDepartment);
    console.log("Added Department:", newDepartment);
    return newDepartment;
};

export const updateDepartment = async (department: Department): Promise<Department> => {
    await delay(200);
    const index = mockDepartments.findIndex(d => d.department_id === department.department_id);
    if (index !== -1) {
        mockDepartments[index] = { ...mockDepartments[index], ...department }; // Обновляем поля
        console.log("Updated Department:", mockDepartments[index]);
        return mockDepartments[index];
    }
    throw new Error("Department not found");
};

export const deleteDepartment = async (department_id: number): Promise<void> => {
    await delay(200);
    const initialLength = mockDepartments.length;
    mockDepartments = mockDepartments.filter(d => d.department_id !== department_id);
    if (mockDepartments.length === initialLength) {
         throw new Error("Department not found");
    }
    console.log("Deleted Department ID:", department_id);
};

// --- Position API ---

export const fetchPositions = async (
    page: number,
    pageSize: number,
    filterModel?: GridFilterModel,
    sortModel?: GridSortModel
): Promise<PaginatedData<Position>> => {
    await delay(300);
    console.log("Fetching Positions:", { page, pageSize, filterModel, sortModel });
    // TODO: Добавить логику фильтрации и сортировки
    let filteredItems = [...mockPositions];
     if (filterModel?.items?.length) {
        const nameFilter = filterModel.items.find(f => f.field === 'position_name');
        if (nameFilter?.value) {
            filteredItems = filteredItems.filter(p =>
                p.position_name.toLowerCase().includes(String(nameFilter.value).toLowerCase())
            );
        }
    }
    if (sortModel?.length) {
        const sort = sortModel[0];
        if (sort.field === 'position_name') {
            filteredItems.sort((a, b) => {
                const compare = a.position_name.localeCompare(b.position_name);
                return sort.sort === 'desc' ? -compare : compare;
            });
        }
    }
    const total = filteredItems.length;
    const items = applyPagination(filteredItems, page, pageSize);
    return { items, total };
};

export const addPosition = async (position: Omit<Position, 'position_id'>): Promise<Position> => {
    await delay(200);
    const newPosition: Position = { ...position, position_id: nextPosId++ };
    mockPositions.push(newPosition);
    console.log("Added Position:", newPosition);
    return newPosition;
};

export const updatePosition = async (position: Position): Promise<Position> => {
    await delay(200);
    const index = mockPositions.findIndex(p => p.position_id === position.position_id);
    if (index !== -1) {
        mockPositions[index] = { ...mockPositions[index], ...position };
        console.log("Updated Position:", mockPositions[index]);
        return mockPositions[index];
    }
    throw new Error("Position not found");
};

export const deletePosition = async (position_id: number): Promise<void> => {
    await delay(200);
     const initialLength = mockPositions.length;
    mockPositions = mockPositions.filter(p => p.position_id !== position_id);
     if (mockPositions.length === initialLength) {
         throw new Error("Position not found");
    }
    console.log("Deleted Position ID:", position_id);
};

// --- Employee API ---

// Функция для обогащения данных сотрудника именами (имитация JOIN)
const enrichEmployee = (emp: Employee): Employee => {
    const department = mockDepartments.find(d => d.department_id === emp.department_id);
    const position = mockPositions.find(p => p.position_id === emp.position_id);
    const manager = mockEmployees.find(m => m.employee_id === emp.manager_id);
    return {
        ...emp,
        department_name: department?.department_name || 'N/A',
        position_name: position?.position_name || 'N/A',
        manager_name: manager ? `${manager.first_name} ${manager.last_name}` : 'N/A',
    };
};


export const fetchEmployees = async (
    page: number,
    pageSize: number,
    filterModel?: GridFilterModel,
    sortModel?: GridSortModel
): Promise<PaginatedData<Employee>> => {
    await delay(400);
    console.log("Fetching Employees:", { page, pageSize, filterModel, sortModel });

    // TODO: Добавить логику фильтрации и сортировки
    let filteredItems = [...mockEmployees];

    // Пример фильтрации (добавить больше полей)
    if (filterModel?.items?.length) {
        filterModel.items.forEach(filter => {
            if (filter.value) {
                const filterValue = String(filter.value).toLowerCase();
                filteredItems = filteredItems.filter(emp => {
                    const empValue = String((emp as any)[filter.field] ?? '').toLowerCase();
                    // Простая проверка 'contains'
                    return empValue.includes(filterValue);
                });
            }
        });
    }

    // Пример сортировки (добавить больше полей)
     if (sortModel?.length) {
        const sort = sortModel[0];
        filteredItems.sort((a, b) => {
            const valA = (a as any)[sort.field] ?? '';
            const valB = (b as any)[sort.field] ?? '';
            const compare = String(valA).localeCompare(String(valB));
            return sort.sort === 'desc' ? -compare : compare;
        });
    }


    console.log("Filtered items count:", filteredItems.length); // Добавьте эту строку
    const total = filteredItems.length;
    console.log(`Applying pagination with page: ${page}, pageSize: ${pageSize}`);
    console.log(`Calculated startIndex: ${page * pageSize}`);
    const paginatedItems = applyPagination(filteredItems, page, pageSize);
    console.log("Paginated items:", paginatedItems); // Посмотрите, что здесь

    // Обогащаем данные именами ПОСЛЕ пагинации для производительности
    const items = paginatedItems.map(enrichEmployee);
    return { items, total };
};

export const fetchEmployeeById = async (employee_id: number): Promise<Employee | null> => {
    await delay(150);
    const employee = mockEmployees.find(e => e.employee_id === employee_id) || null;
    console.log("Fetched Employee by ID:", employee_id, employee);
    // Возвращаем "сырые" данные без обогащения, форма сама подтянет списки
    return employee ? { ...employee } : null;
}

export const addEmployee = async (employeeData: Omit<Employee, 'employee_id' | 'department_name' | 'position_name' | 'manager_name'>): Promise<Employee> => {
    await delay(200);
    // Убедимся, что salary это число или null
    const salary = typeof employeeData.salary === 'string' && employeeData.salary !== ''
        ? parseFloat(employeeData.salary)
        : employeeData.salary === '' ? null : employeeData.salary;

    const newEmployee: Employee = {
        ...employeeData,
        employee_id: nextEmpId++,
        salary: typeof salary === 'number' ? salary : null, // Сохраняем как число или null
        department_id: employeeData.department_id || null, // Убедимся что это null если не выбрано
        position_id: employeeData.position_id || null,
        manager_id: employeeData.manager_id || null,
    };
    mockEmployees.push(newEmployee);
    console.log("Added Employee:", newEmployee);
    return enrichEmployee(newEmployee); // Возвращаем обогащенные данные
};

export const updateEmployee = async (employeeData: Employee): Promise<Employee> => {
    await delay(200);
    const index = mockEmployees.findIndex(e => e.employee_id === employeeData.employee_id);
    if (index !== -1) {
         // Убедимся, что salary это число или null
        const salary = typeof employeeData.salary === 'string' && employeeData.salary !== ''
            ? parseFloat(employeeData.salary)
            : employeeData.salary === '' ? null : employeeData.salary;

        // Обновляем только поля, пришедшие из формы, сохраняя ID
        const updatedEmployee = {
            ...mockEmployees[index], // Берем существующего
            ...employeeData,        // Накатываем изменения из формы
            salary: typeof salary === 'number' ? salary : null,
            department_id: employeeData.department_id || null,
            position_id: employeeData.position_id || null,
            manager_id: employeeData.manager_id || null,
        };
        // Удаляем временные поля имен перед сохранением в "базу"
        delete updatedEmployee.department_name;
        delete updatedEmployee.position_name;
        delete updatedEmployee.manager_name;

        mockEmployees[index] = updatedEmployee;
        console.log("Updated Employee:", updatedEmployee);
        return enrichEmployee(updatedEmployee); // Возвращаем обогащенные данные
    }
    throw new Error("Employee not found");
};

export const deleteEmployee = async (employee_id: number): Promise<void> => {
    await delay(200);
    const initialLength = mockEmployees.length;
    mockEmployees = mockEmployees.filter(e => e.employee_id !== employee_id);
     if (mockEmployees.length === initialLength) {
         throw new Error("Employee not found");
    }
    console.log("Deleted Employee ID:", employee_id);
};

// --- Вспомогательные функции для получения списков для Select ---
export const fetchDepartmentList = async (): Promise<SimpleListItem[]> => {
    await delay(100);
    return mockDepartments.map(d => ({ id: d.department_id, name: d.department_name }));
}
export const fetchPositionList = async (): Promise<SimpleListItem[]> => {
     await delay(100);
    return mockPositions.map(p => ({ id: p.position_id, name: p.position_name }));
}
// Получаем список сотрудников для выбора руководителя
export const fetchManagerList = async (): Promise<SimpleListItem[]> => {
     await delay(100);
    // Обычно не включают текущего редактируемого сотрудника в этот список
    return mockEmployees.map(e => ({ id: e.employee_id, name: `${e.first_name} ${e.last_name}` }));
}
