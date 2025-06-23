import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Container, Tabs, Tab } from '@mui/material';
import { api } from './api';
import { Metric } from './types';
// import SystemMetricTable from './SystemMetricTable';
import SystemMetricTable2 from './SystemMetricTable2';

const REFRESH_INTERVAL_MS = 5000;

const SystemMetricForm: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Получаем уникальные группы метрик
  const groupNames = Array.from(new Set(metrics.map(m => m.group_name)));

  const fetchData = async () => {
    try {
      const data = await api.get();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить метрики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (loading && metrics.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Загрузка метрик...</Typography>
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
        Системные метрики
      </Typography>

      <Tabs value={selectedTab} onChange={handleChange} centered aria-label="system metric tabs">
        {groupNames.map((group, _idx) => (
          <Tab key={group} label={group} />
        ))}
      </Tabs>

      <Typography variant="caption" display="block" align="right" sx={{ mt: 1 }}>
        Last updated: {new Date().toLocaleTimeString()}
      </Typography>

      {groupNames.length > 0 && (
        <SystemMetricTable2
            group_name={groupNames[selectedTab]}
            metrics={metrics.filter(m => m.group_name === groupNames[selectedTab])}
        />
      )}
    </Container>
  );
};

export default SystemMetricForm;