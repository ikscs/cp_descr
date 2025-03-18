import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createFilesFromResponse(response, baseDir = '.') {
  const fileBlocks = response.split('\n\n');

  for (const block of fileBlocks) {
    const lines = block.split('\n');
    const filenameLine = lines[0];
    const contentLines = lines.slice(1);

    if (filenameLine && filenameLine.startsWith('**')) {
      // Обновленное регулярное выражение
      const filenameMatch = 
        filenameLine.match(/\*\*\s*\d+\.\s*`(.*?)`:\*\*/) ||
        filenameLine.match(/\*\*\s*\d+\.\s*'(.*?)':\*\*/);

      if (filenameMatch && contentLines.length > 0) {
        const filePath = path.join(baseDir, filenameMatch[1]);
        const fileContent = contentLines.slice(1).join('\n');

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          try {
            fs.mkdirSync(dir, { recursive: true });
          } catch (err) {
            console.error('Ошибка создания директории:', err);
            continue;
          }
        }

        try {
          fs.writeFileSync(filePath, fileContent);
          console.log(`Файл ${filePath} создан.`);
        } catch (err) {
          console.error('Ошибка записи файла:', err);
        }
      } else {
        console.log('Неправильный формат строки:', filenameLine);
      }
    }
  }
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let inputData = '';

  for await (const line of rl) {
    inputData += line + '\n';
  }

  rl.close();
  process.stdin.destroy(); // Явно закрываем поток ввода

  await createFilesFromResponse(inputData);
  console.log('Файлы созданы!');
}

// console.log('Введите данные для создания файлов:');
// console.log('Пример:');
// console.log('** 1. `file1.txt`: **');
// console.log('Содержимое файла 1');
// console.log('** 2. `file2.txt`: **');
// console.log('Содержимое файла 2');

// main();

// const fs = require('fs');

function parseCodeBlocks(text) {
  const blocks = [];
  const regex = /\*\*(\d+)\.\s`([^`]+)`:\*\*\s*```typescript([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    blocks.push({
      fileName: match[2],
      code: match[3].trim(),
    });
  }

  return blocks;
}

function createFilesFromBlocks(blocks) {
  blocks.forEach(block => {
    const filePath = path.join(__dirname, block.fileName); // Создаем путь к файлу
    const directory = path.dirname(filePath); // Получаем директорию файла

    // Создаем директорию, если она не существует
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Записываем содержимое блока в файл
    fs.writeFileSync(filePath, block.code);
    console.log(`Файл ${block.fileName} создан.`);
  });
}

const filename = process.argv[2]; // Получаем имя файла из аргументов командной строки

if (!filename) {
  console.error('Необходимо указать имя файла.');
  process.exit(1);
} else {
  console.log('Имя файла:', filename);
}

try {
  const inputData = fs.readFileSync(filename, 'utf8');
  // console.log('Содержимое файла:', inputData);
  // await createFilesFromResponse(inputData);
  const parsedBlocks = parseCodeBlocks(inputData);
  // console.log(parsedBlocks);
  createFilesFromBlocks(parsedBlocks);
  console.log('Ready');
} catch (err) {
  console.error('Ошибка чтения файла:', err);
}