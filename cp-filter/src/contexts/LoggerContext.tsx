import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ILoggerContext {
    loggerText: string; setLoggerText: React.Dispatch<React.SetStateAction<string>>;
}

const LoggerContext = createContext<ILoggerContext | undefined>(undefined);

export const LoggerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loggerText, setLoggerText] = useState<string>('');

    return (
        <LoggerContext.Provider value={{ 
            loggerText, setLoggerText,
        }}>
        {children}
        </LoggerContext.Provider>
    );
};

export const useLoggerContext = () => {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error('useLoggerContext must be used within a LoggerProvider');
  }
  return context;
};
