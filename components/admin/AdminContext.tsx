import React, { createContext, ReactNode, useContext, useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

type AdminContextValue = {
  error: string;
  status: string;
  setError: (msg: string) => void;
  setStatus: (msg: string) => void;
  clearMessages: () => void;
  /** Устгах баталгаажуулах modal нээнэ. Баталгаажуулбал modal хаагдаад onConfirm ажиллана. */
  askConfirm: (message: string, onConfirm: () => void | Promise<void>) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void | Promise<void> } | null>(null);

  const clearMessages = () => {
    setError('');
    setStatus('');
  };

  const askConfirm: AdminContextValue['askConfirm'] = (message, onConfirm) => {
    setConfirmState({ message, onConfirm });
  };

  const closeConfirm = () => setConfirmState(null);

  return (
    <AdminContext.Provider value={{ error, status, setError, setStatus, clearMessages, askConfirm }}>
      {children}
      <ConfirmModal
        open={confirmState !== null}
        message={confirmState?.message ?? ''}
        onConfirm={() => {
          const pending = confirmState;
          closeConfirm();
          pending?.onConfirm();
        }}
        onCancel={closeConfirm}
      />
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}
