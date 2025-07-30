// src/App.tsx
import React, { useEffect } from 'react';
import { DataModuleProvider, useDataModule } from './DataModuleContext';
import { APP_DATA_DEFINITIONS } from './appDataDefinitionsExample'; // Импортируем определения для нашего приложения
import './App.css'; // Добавьте базовые стили, если нужно

// --- Компоненты, использующие контекст ---

/**
 * Компонент для отображения данных конкретного датасета.
 * Он просто запрашивает данные по ключу.
 */
const DataDisplayComponent: React.FC<{ dataKey: string }> = ({ dataKey }) => {
  const { data, isLoading, error, fetchDataSet } = useDataModule();

  useEffect(() => {
    // Запускаем загрузку данных, когда компонент монтируется
    fetchDataSet(dataKey);
  }, [dataKey, fetchDataSet]); // Зависимости для useEffect

  const currentDataSet = data[dataKey];
  const isKeyLoading = isLoading && !currentDataSet; // Локальный индикатор загрузки для данного ключа

  if (isKeyLoading) {
    return <div className="loading-message">Загрузка данных для **{dataKey}**...</div>;
  }

  if (error) {
    return <div className="error-message">Ошибка при загрузке данных для **{dataKey}**: {error}</div>;
  }

  return (
    <div className="data-section">
      <h3>Данные **{dataKey}**:</h3>
      {currentDataSet && currentDataSet.length > 0 ? (
        <ul>
          {currentDataSet.map((item) => (
            <li key={item.value}>
              **{item.value}**: {item.label}
            </li>
          ))}
        </ul>
      ) : (
        <p>Данные для **{dataKey}** отсутствуют или еще не загружены.</p>
      )}
    </div>
  );
};

// --- Основное приложение ---

const App: React.FC = () => {
  // Получаем функцию fetchDataSet прямо здесь, чтобы привязать ее к кнопке
  // В этом случае useDataModule должен быть вызван внутри компонента,
  // обернутого в DataModuleProvider. Здесь это просто для демонстрации.
  const { fetchDataSet } = useDataModule();

  return (
    // Оборачиваем все приложение в DataModuleProvider, передавая ему определения
    <DataModuleProvider dataDefinitions={APP_DATA_DEFINITIONS}>
      <div className="container">
        <h1>Пример Ленивой Загрузки Данных</h1>

        <DataDisplayComponent dataKey="ds1" />
        <hr />
        <DataDisplayComponent dataKey="ds2" />
        <hr />

        <div className="button-section">
          <button onClick={() => fetchDataSet('ds3')}>
            Загрузить DS3 (по клику)
          </button>
        </div>
        <DataDisplayComponent dataKey="ds3" />
      </div>
    </DataModuleProvider>
  );
};

export default App;