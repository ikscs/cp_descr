import React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

interface ContactsViewProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const ContactsViewContent: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <Typography variant="body1">Юридический адрес: ул. Примерная, д. 1</Typography>
      <Typography variant="body1">Телефон: +44 (123) 456-78-90</Typography>
      <Typography variant="body1">Рабочие часы: Пн-Пт, 9:00-18:00</Typography>
    </div>
  );
};

const ContactsView: React.FC<ContactsViewProps> = ({ anchorEl, onClose }) => {
  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <ContactsViewContent />
    </Popover>
  );
};

export default ContactsView;