import React from 'react';
import { createRoot } from 'react-dom/client';
import { SimpleDialog } from './SimpleDialog';

export const customConfirm = (message: string, title = 'Підтвердіть дію'): Promise<boolean> => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleConfirm = () => {
      root.unmount();
      container.remove();
      resolve(true);
    };

    const handleCancel = () => {
      root.unmount();
      container.remove();
      resolve(false);
    };

    root.render(
      <SimpleDialog
        open={true}
        title={title}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        showCancelButton={true}
      />
    );
  });
};