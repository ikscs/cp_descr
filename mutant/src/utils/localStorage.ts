// Ключі для localStorage
export const LOCAL_STORAGE_KEY_COLLAPSED = 'sidebar2IsCollapsed';
export const LOCAL_STORAGE_KEY_OPEN_SUBMENUS = 'sidebar2OpenSubMenus';

/**
 * Загальна функція для отримання даних з localStorage
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
        return defaultValue;
    }

    const savedValue = localStorage.getItem(key);
    if (savedValue === null) {
        return defaultValue;
    }

    try {
        return JSON.parse(savedValue) as T;
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage:`, e);
        return defaultValue;
    }
}

/**
 * Загальна функція для збереження даних в localStorage
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
    }
}

/**
 * Специфічні функції для роботи з станом згортання сайдбару
 */
export function getSidebarCollapsedState(defaultValue: boolean): boolean {
    return getFromLocalStorage<boolean>(LOCAL_STORAGE_KEY_COLLAPSED, defaultValue);
}

export function saveSidebarCollapsedState(isCollapsed: boolean): void {
    saveToLocalStorage(LOCAL_STORAGE_KEY_COLLAPSED, isCollapsed);
}

/**
 * Специфічні функції для роботи з відкритими підменю
 */
export function getSidebarOpenSubmenus(defaultValue: Record<string, boolean> = {}): Record<string, boolean> {
    return getFromLocalStorage<Record<string, boolean>>(LOCAL_STORAGE_KEY_OPEN_SUBMENUS, defaultValue);
}

export function saveSidebarOpenSubmenus(openSubMenus: Record<string, boolean>): void {
    saveToLocalStorage(LOCAL_STORAGE_KEY_OPEN_SUBMENUS, openSubMenus);
} 