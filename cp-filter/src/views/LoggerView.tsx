import { useLoggerContext } from "../contexts/LoggerContext";
import { useRef, useEffect } from 'react';

export const Log = (text: string) => {
    const { loggerText, setLoggerText } = useLoggerContext();
    setLoggerText(loggerText + text + '\n');
};

const LoggerView = () => {
    const { loggerText, setLoggerText } = useLoggerContext();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
    }, [loggerText]);

    return (
        <div style={{ position: 'relative' }}> {/* Добавляем относительное позиционирование */}
            <textarea
                ref={textareaRef}
                id='textarea'
                value={loggerText}
                style={{ width: 800, height: 800 }}
                readOnly
            />
            <button
                style={{
                    position: 'absolute', // Абсолютное позиционирование
                    top: '8px', // Отступ сверху
                    right: '12px', // Отступ справа
                    cursor: 'pointer',
                    // background: 'none', // Убираем фон кнопки
                    // border: 'none', // Убираем рамку кнопки
                    // padding: '0', // Убираем внутренние отступы
                }}
                title="Clear"
                onClick={() => {setLoggerText('')}}
            >
                <img src="/src/assets/close.png"
                    alt="Clear"
                    style={{ width: '12px', height: '12px' }}
                />
            </button>
        </div>    );
};

export default LoggerView;