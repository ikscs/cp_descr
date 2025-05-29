import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FormsList } from './components/forms/FormsList';
import { FormHistory } from './components/forms/FormHistory';
import { DatabaseFormWizard } from './components/forms/DatabaseFormWizard';

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/forms" replace />} />
            <Route path="/forms" element={<FormsList />} />
            <Route path="/forms/new" element={<DatabaseFormWizard />} />
            <Route path="/forms/:id/history" element={<FormHistory />} />
        </Routes>
    );
}; 