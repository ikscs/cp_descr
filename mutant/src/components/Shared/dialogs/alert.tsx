import React from 'react';
import { createRoot } from 'react-dom/client';
import { SimpleDialog } from './SimpleDialog';

export const customAlert = (message: string, title = 'Увага'): Promise<void> => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleConfirm = () => {
      root.unmount();
      container.remove();
      resolve();
    };

    root.render(
      <SimpleDialog
        open={true}
        title={title}
        message={message}
        onConfirm={handleConfirm}
      />
    );
  });
};