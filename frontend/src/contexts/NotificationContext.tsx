import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface Notification {
  message: string;
  severity: AlertColor; // 'error' | 'warning' | 'info' | 'success'
}

const NotificationContext = createContext<{
  notify: (message: string, severity?: AlertColor) => void;
}>({
  notify: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState<Notification>({ message: '', severity: 'error' });

  const notify = useCallback((message: string, severity: AlertColor = 'error') => {
    setNotification({ message, severity });
    setOpen(true);
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};