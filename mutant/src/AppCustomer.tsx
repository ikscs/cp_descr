import React, { type JSX } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUserfront } from '@userfront/react';
import AuthenticatedLayout from './AuthenticatedLayout';
import { type MenuItem } from './components/Shared/SideBar';
import { CustomerProvider, type CustomerData } from './context/CustomerContext'; // Предполагаемый путь
import { Box } from '@mui/material';

import DashboardView from './pages/dashboard/DashboardBtView';
// import DashboardView from './pages/dashboard/DashboardBtView_copy';
import { SelectCustomer } from './components/Customer/SelectCustomer';
import Users from './components/Users/UserList';
import RoleList from './components/Roles/RoleList';
import PointList from './components/Points/PointList';
import OriginView from './components/Origins/OriginView';
import GroupList from './components/Groups/GroupList';
import ReportList from './pages/Reports/ReportList';
import ViewerReportList from './pages/Reports/ViewerReportList';
// import GeneralSettings from './pages/Settings/GeneralSettings';
import GeneralSettings from './pages/Settings/GeneralSettings_i18n';
import ReportListSettings from './pages/Settings/ReportListSettings';
import DepartmentList from './pages/Enterprise/components/departments/DepartmentList';
import PositionList from './pages/Enterprise/components/positions/PositionList';
import EmployeeList from './pages/Enterprise/components/employees/EmployeeList';
import { CustomerPage } from './pages/CustomerPage';
import { PasswordResetForm } from '@userfront/react'; // На случай если пользователь захочет сбросить пароль будучи залогиненым
import { FormsList } from './components/forms/FormsList';
import { FormHistory } from './components/forms/FormHistory';
import { DatabaseFormWizard } from './components/forms/DatabaseFormWizard';
import { FormEditor } from './components/forms/FormEditor';
import PersonList from './components/Persons/PersonList';
import SysParamsForm from './components/SysParams/SysParamsFormJson';
import SystemStatusForm from './components/SysState/SystemStatusForm';
import SystemMetricForm from './components/SysMetrics/SystemMetricForm';
import AdvertsView from './pages/adverts/AdvertsView';
import ThemeList from './components/themes/ThemeList';
import BalanceForm from './components/Billing/BillingForm';

// Protected Route Component
const ProtectedRoute = ({
  user,
  requiredRole,
  children,
}: {
  user: any;
  requiredRole: string;
  children: JSX.Element;
}) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && !user.hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

interface AppCustomerProps {
  user: any; // Замените 'any' на более конкретный тип пользователя
  menuItems: MenuItem[];
  appTitle: string;
  onLogout: () => void;
  customerData: CustomerData | null;
  isLoadingCustomerData: boolean;
}

const LogoutHandler: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    React.useEffect(() => {
        onLogout();
    }, [onLogout]);
    return null; // Этот компонент ничего не рендерит
};

const AppCustomer: React.FC<AppCustomerProps> = ({
  user,
  menuItems,
  appTitle,
  onLogout,
  customerData,
  isLoadingCustomerData,
}) => {

  const Userfront = useUserfront();
  const navigate = useNavigate();

  const handleLogout = () => {
      Userfront.logout();
      navigate('/login');
  };

  return (
    <CustomerProvider customerData={customerData} isLoading={isLoadingCustomerData}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <AuthenticatedLayout
          userName={user.username}
          menuItems={menuItems}
          appTitle={appTitle}
          onLogout={onLogout}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/adverts" element={<AdvertsView />} />
            <Route path="/logout" element={<LogoutHandler onLogout={handleLogout} />} />
            <Route path="/selectCustomer" element={<SelectCustomer />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<RoleList />} />
            {/* <Route path="/points" element={<ProtectedRoute user={user} requiredRole="admin"><PointList /></ProtectedRoute>} /> */}
            <Route path="/points" element={<ProtectedRoute user={user} requiredRole="viewer"><PointList /></ProtectedRoute>} />
            <Route path="/origins" element={<ProtectedRoute user={user} requiredRole="admin"><OriginView /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute user={user} requiredRole="admin"><GroupList /></ProtectedRoute>} />
            <Route path="/persons" element={<ProtectedRoute user={user} requiredRole="admin"><PersonList /></ProtectedRoute>} />
            <Route path="/reports" element={<ReportList />} />
            <Route path="/viewerReports" element={<ViewerReportList />} />
            <Route path="/settings/themes" element={<ThemeList />} />
            <Route path="/settings/sysparam" element={<SysParamsForm />} />
            <Route path="/settings/sysstate" element={<SystemStatusForm />} />
            <Route path="/settings/sysmetric" element={<SystemMetricForm />} />
            <Route path="/settings/general" element={<GeneralSettings />} />
            <Route path="/settings/report-list" element={<ProtectedRoute user={user} requiredRole="editor"><ReportListSettings /></ProtectedRoute>} />
            <Route path="/billing" element={<BalanceForm />} />
            <Route path="/enterprise/departments" element={<ProtectedRoute user={user} requiredRole="owner"><DepartmentList /></ProtectedRoute>} />
            <Route path="/enterprise/positions" element={<ProtectedRoute user={user} requiredRole="owner"><PositionList /></ProtectedRoute>} />
            <Route path="/enterprise/employees" element={<ProtectedRoute user={user} requiredRole="owner"><EmployeeList /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute user={user} requiredRole="owner"><CustomerPage /></ProtectedRoute>} />
            <Route path="/reset" element={<PasswordResetForm />} />
            <Route path="/forms" element={<ProtectedRoute user={user} requiredRole="owner"><FormsList /></ProtectedRoute>} />
            <Route path="/forms/new" element={<DatabaseFormWizard />} />
            <Route path="/forms/:id/edit" element={<FormEditor />} />
            <Route path="/forms/:id/history" element={<FormHistory />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthenticatedLayout>
      </Box>
    </CustomerProvider>
  );
};

export default AppCustomer;