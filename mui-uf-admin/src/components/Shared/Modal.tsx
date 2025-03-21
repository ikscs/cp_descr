import React from 'react';
import './Modal.css'; // Импортируем файл стилей

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay"> {/* Используем новый класс для оверлея */}
            <div className="modal-content">
                {children}
                <button className="modal-close-button" onClick={onClose}>Закрыть</button> {/* Используем новый класс для кнопки */}
            </div>
        </div>
    );
};

export default Modal;
