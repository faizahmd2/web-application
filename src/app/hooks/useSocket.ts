import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

export default function useSocket(roomId: string | undefined) {
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const socketInstance = io(SOCKET_SERVER_URL);
        setSocket(socketInstance);

        if(roomId) socketInstance.emit('joinRoom', roomId);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return { socket };
}
