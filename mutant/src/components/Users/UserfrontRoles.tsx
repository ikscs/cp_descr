import React, { useState, useEffect } from 'react';
import { fetchRoles } from '../../api/fetchRoles';
import { useTranslation } from "react-i18next";

interface UserfrontRolesProps {
  user: any;
}

const UserfrontRoles: React.FC<UserfrontRolesProps> = ({ user }) => {
  const { t } = useTranslation();
  const [userRoles, setUserRoles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
    try { 
        setLoading(true);
        setError(null);
        const roles = await fetchRoles();
        const filtered = roles.filter(role => user.hasRole(role));
        setUserRoles(filtered);
        setLoading(false);
    } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Произошла неизвестная ошибка');
        }
        setLoading(false);
      }    
    };
    fetchUserRoles();
  }, [user]);
  
  if (loading) {
    return <div>Загрузка ролей...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Ошибка: {error}</div>;
  }

  if (!userRoles || userRoles.length === 0) {
    return <div>У пользователя нет назначенных ролей.</div>;
  }

  return (
    <div>
      {/* <h3>Роли пользователя:</h3> */}
      <h3>{t('UserfrontRoles.title')}:</h3>
      <ul>
        {userRoles.map((role, index) => (
          <li key={index}>{role}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserfrontRoles;