import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createResponseFromFolder(folderPath, outputFile) {
  let response = '';
  const files = fs.readdirSync(folderPath, { recursive: true });
  let fileCount = 1; // Инициализируем счетчик файлов

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(folderPath, filePath);
      response += `** ${fileCount}. \`${path.join(folderPath, relativePath)}\`: **\n`; // Используем счетчик файлов
      response += '```typescript\n';
      response += fileContent + '\n';
      response += '```\n\n';
      fileCount++; // Увеличиваем счетчик файлов
    }
  });

  if (outputFile) {
    fs.writeFileSync(outputFile, response.trim());
    console.log(`Результат сохранен в файл: ${outputFile}`);
  } else {
    console.log(response.trim());
  }
}

const folderPath = process.argv[2];
const outputFile = process.argv[3];

if (!folderPath) {
  console.log('Использование:');
  console.log('node files2response.js <путь_к_папке> [имя_выходного_файла]');
  console.log('  <путь_к_папке> - обязательный параметр, путь к папке для обработки.');
  console.log('  [имя_выходного_файла] - необязательный параметр, имя файла для сохранения результата.');
  process.exit(1);
}

if (!fs.existsSync(folderPath)) {
  console.error(`Папка "${folderPath}" не существует.`);
  process.exit(1);
}

if (!fs.statSync(folderPath).isDirectory()) {
  console.error(`"${folderPath}" не является папкой.`);
  process.exit(1);
}

try {
  createResponseFromFolder(folderPath, outputFile);
  console.log('Готово');
} catch (err) {
  console.error('Ошибка:', err);
}