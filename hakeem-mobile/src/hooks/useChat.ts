import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { InternalMessage } from '../types/clinic.types';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

interface UseChatOptions {
  clinicId: number;
  token: string | null;
  onMessage: (msg: InternalMessage) => void;
}

export function useChat({ clinicId, token, onMessage }: UseChatOptions) {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (!token || !clinicId) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      socket.emit('join_patient_chat', { clinicId });
    });

    socket.on('new_message', (msg: InternalMessage) => {
      onMessage(msg);
    });

    socket.on('connect_error', (err) => {
      const safeMsg = String(err.message).replace(/[\r\n]+/g, ' ');
      console.error('Socket error:', safeMsg);
    });

    socketRef.current = socket;
  }, [clinicId, token]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [connect]);

  const sendTyping = useCallback(() => {
    socketRef.current?.emit('typing', { clinicId });
  }, [clinicId]);

  return { sendTyping };
}
