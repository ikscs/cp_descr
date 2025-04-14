// src/store/employeeStore.ts
import { create } from 'zustand';
import { Employee } from '../types/employee';

interface EmployeeState {
  employees: Employee[];
  selectedEmployeeId: number | null;
  addEmployee: (employeeData: Omit<Employee, 'id'>) => void;
  updateEmployee: (updatedEmployee: Employee) => void;
  deleteEmployee: (id: number) => void;
  selectEmployee: (id: number | null) => void;
}

// Начальные данные для примера
const initialEmployees: Employee[] = [
  { id: 1, name: 'Иван Петров', position: 'Разработчик', email: 'ivan.p@example.com' },
  { id: 2, name: 'Мария Сидорова', position: 'Дизайнер', email: 'maria.s@example.com' },
  { id: 3, name: 'Алексей Иванов', position: 'Менеджер', email: 'alex.i@example.com' },
];

let nextId = initialEmployees.length + 1; // Простой генератор ID для примера

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: initialEmployees,
  selectedEmployeeId: null,

  addEmployee: (employeeData) =>
    set((state) => ({
      employees: [...state.employees, { ...employeeData, id: nextId++ }],
      selectedEmployeeId: null, // Сбрасываем выбор после добавления
    })),

  updateEmployee: (updatedEmployee) =>
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      ),
      selectedEmployeeId: null, // Сбрасываем выбор после обновления
    })),

  deleteEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((emp) => emp.id !== id),
      // Если удаляем выбранного сотрудника, сбрасываем выбор
      selectedEmployeeId: state.selectedEmployeeId === id ? null : state.selectedEmployeeId,
    })),

  selectEmployee: (id) => set({ selectedEmployeeId: id }),
}));
