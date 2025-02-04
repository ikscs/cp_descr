// App.tsx
import React, { useState } from 'react';
import ModalWrapper from '../components/ModalWrapper';

const ModalExam: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <h1>ModalWrapper Example</h1>
      <button onClick={openModal}>Open Modal</button>
      <ModalWrapper isOpen={isModalOpen} onClose={closeModal}>
        <form>
          <h3>ModalWrapper Example</h3>
          <label>
            Name:
            <input type="text" name="name" />
          </label>
          <br/>
          <label>
            Email:
            <input type="email" name="email" />
          </label>
          <br/>
          <button type="submit">Submit</button>
        </form>
      </ModalWrapper>
    </div>
  );
};

export default ModalExam;
