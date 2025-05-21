import React, { useState, useCallback } from 'react';
import OriginsList from './OriginsList';
import OriginsForm from './OriginsForm';
import { Modal, Box, Button, Typography } from '@mui/material';

// Стили для модального окна, аналогичные PointList/UserList
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600, // Можно настроить ширину
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
};

/**
 * @typedef {object} Origin
 * @property {number} id
 * @property {number} point_id
 * @property {string} name
 * @property {string} origin
 * @property {number} origin_type_id
 * @property {object|string} [credentials]
 * @property {boolean} is_enabled
 */

const OriginsView = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  /** @type {[Origin|null, Function]} */
  const [originToEdit, setOriginToEdit] = useState(null);
  const [refreshListKey, setRefreshListKey] = useState(0); // Для принудительного обновления списка

  // Обработчик для кнопки "Add New Origin" в OriginsList
  const handleAddOrigin = useCallback(() => {
    setOriginToEdit(null);
    setIsFormOpen(true);
  }, []);

  // Обработчик для кнопки "Edit" в OriginsList
  /** @param {Origin} origin */
  const handleEditOrigin = useCallback((origin) => {
    setOriginToEdit(origin);
    setIsFormOpen(true);
  }, []);

  // Обработчик для кнопки "Save" в OriginsForm
  // OriginsForm сам вызывает API для сохранения.
  // Этот обработчик вызывается после успешного сохранения в OriginsForm.
  const handleSaveSuccess = useCallback(() => {
    setIsFormOpen(false);
    setOriginToEdit(null);
    setRefreshListKey(prevKey => prevKey + 1); // Увеличиваем ключ для обновления OriginsList
  }, []);

  // Обработчик для кнопки "Cancel" в OriginsForm
  const handleCancelForm = useCallback(() => {
    setIsFormOpen(false);
    setOriginToEdit(null);
  }, []);

  // Пример фильтра по point_id, если это необходимо.
  // const pointIdFilter = 1; // Замените на реальный ID или получите его из контекста/URL

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Управление источниками (Камерами, Регистраторами)
      </Typography>
      <OriginsList
        key={refreshListKey} // Пересоздаст компонент и вызовет useEffect для загрузки данных
        onEditOrigin={handleEditOrigin}
        onAddOrigin={handleAddOrigin}
        // pointIdFilter={pointIdFilter} // Раскомментируйте, если нужна фильтрация
      />

      <Modal open={isFormOpen} onClose={handleCancelForm}>
        <Box sx={modalStyle}>
          <OriginsForm
            // Ключ важен для сброса состояния формы при изменении originToEdit
            key={originToEdit ? `edit-${originToEdit.id}` : 'add-origin'}
            originToEdit={originToEdit}
            onSave={handleSaveSuccess} // Вызывается после успешного сохранения в OriginsForm
            onCancel={handleCancelForm}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default OriginsView;