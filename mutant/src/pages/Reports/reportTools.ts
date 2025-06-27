// подстановка значений в шаблонные строки
export const fillPlaceholders = (
    text: string, 
    replacements: { name: string; value: string | number | boolean }[]
): string => {
    let result = text;

    for (const replacement of replacements) {
        const regex = new RegExp(`:${replacement.name}`, 'g');
        result = result.replace(regex, String(replacement.value));
    }

    return result;
};