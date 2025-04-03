import { useState, useEffect, useCallback } from 'react';
import { roomApi } from '../services/api';

const getSessionStorageKey = (roomId: string) => `admin_${roomId}`;

export const useAdmin = (roomId: string) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const checkAdminStatus = useCallback(async () => {
    setIsLoading(true);
    setVerificationError(null);
    const sessionKey = getSessionStorageKey(roomId);
    const storedPassword = sessionStorage.getItem(sessionKey);

    if (storedPassword) {
      try {
        const response = await roomApi.verifyAdmin(roomId, storedPassword);
        if (response.isValid) {
          setIsAdmin(true);
        } else {
          // Password in session storage is invalid, remove it
          sessionStorage.removeItem(sessionKey);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error verifying admin status:", error);
        // Keep admin false, potentially show an error message?
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    setIsLoading(false);
  }, [roomId]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  const verifyAdminPassword = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    setVerificationError(null);
    try {
      const response = await roomApi.verifyAdmin(roomId, password);
      if (response.isValid) {
        const sessionKey = getSessionStorageKey(roomId);
        sessionStorage.setItem(sessionKey, password);
        setIsAdmin(true);
        setIsLoading(false);
        return true;
      } else {
        setIsAdmin(false);
        setVerificationError('Invalid admin password.');
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error("Error during admin verification:", error);
      setVerificationError(error.message || 'An error occurred during verification.');
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }
  }, [roomId]);

  const clearAdmin = useCallback(() => {
    const sessionKey = getSessionStorageKey(roomId);
    sessionStorage.removeItem(sessionKey);
    setIsAdmin(false);
  }, [roomId]);

  return {
    isAdmin,
    isLoading,
    verificationError,
    verifyAdminPassword,
    clearAdmin,
    checkAdminStatus // Expose this if manual re-check is needed
  };
}; 