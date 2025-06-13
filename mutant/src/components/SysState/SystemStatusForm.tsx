import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Container, Tabs, Tab } from '@mui/material';
import DiskUsageTable from './DiskUsageTable';
import ContainerStatusTable from './ContainerStatusTable';
import { fetchHostDiskUsage, fetchHostContainerStatus } from './api';
import { HostDiskUsage, HostContainerStatus } from './types';

// Визначте інтервал оновлення в мілісекундах (наприклад, кожні 5 секунд)
const REFRESH_INTERVAL_MS = 5000;

const SystemStatusForm: React.FC = () => {
  const [diskUsageData, setDiskUsageData] = useState<HostDiskUsage[]>([]);
  const [containerStatusData, setContainerStatusData] = useState<HostContainerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Функція для завантаження всіх даних
  const fetchData = async () => {
    try {
      // Встановлюємо loading в true тільки при першому завантаженні або якщо хочемо показати індикатор при кожному оновленні
      // Якщо ви хочете, щоб спіннер з'являвся лише при першому завантаженні,
      // то `setLoading(true)` тут можна прибрати і залишити його лише в `useEffect` для першого виклику.
      // Для зручності, я залишу його, щоб ви бачили, що оновлення відбувається.
      // setLoading(true); // Закоментуйте це, якщо не хочете спіннер при кожному оновленні

      const [diskUsage, containerStatus] = await Promise.all([
        fetchHostDiskUsage(),
        fetchHostContainerStatus(),
      ]);
      setDiskUsageData(diskUsage);
      setContainerStatusData(containerStatus);
      setError(null); // Скидаємо помилку, якщо дані успішно завантажені
    } catch (err) {
      console.error("Failed to fetch system status data:", err);
      setError("Failed to load system status data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Викликаємо fetchData один раз при першому завантаженні компонента
    setLoading(true); // Показуємо спіннер при першому завантаженні
    fetchData();

    // Налаштовуємо інтервал для періодичного оновлення
    const intervalId = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL_MS);

    // Функція очищення: зупиняємо інтервал, коли компонент розмонтовується,
    // щоб уникнути витоків пам'яті та зайвих запитів
    return () => clearInterval(intervalId);
  }, []); // Пустий масив залежностей означає, що ефект запускається один раз при монтуванні та очищається при розмонтуванні

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (loading && diskUsageData.length === 0 && containerStatusData.length === 0) {
    // Показуємо спіннер лише якщо даних ще немає взагалі
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading system status...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Стан системи
      </Typography>

      <Tabs value={selectedTab} onChange={handleChange} centered aria-label="system status tabs">
        <Tab label="Стан дисків" />
        <Tab label="Стан контейнерів" />
      </Tabs>

      {/* Можна додати індикатор останнього оновлення */}
      <Typography variant="caption" display="block" align="right" sx={{ mt: 1 }}>
        Last updated: {new Date().toLocaleTimeString()}
      </Typography>

      {selectedTab === 0 && <DiskUsageTable data={diskUsageData} />}
      {selectedTab === 1 && <ContainerStatusTable data={containerStatusData} />}
    </Container>
  );
};

export default SystemStatusForm;