import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    // أطباء/إداريين: userId -> Set<socketId>
    private userSockets = new Map<number, Set<string>>();

    // مرضى: patientId -> Set<socketId>
    private patientSockets = new Map<number, Set<string>>();

    // تتبع نوع العميل: socketId -> type ('user'|'patient')
    private socketTypes = new Map<string, { type: string; id: number }>();

    handleConnection(client: Socket) {
        try {
            const query = client.handshake.query;
            const clientType = query.type as string;

            if (clientType === 'patient') {
                // اتصال مريض
                const patientIdStr = query.patientId as string;
                if (patientIdStr) {
                    const patientId = Number(patientIdStr);
                    if (!isNaN(patientId)) {
                        this.addPatientSocket(patientId, client.id);
                        this.socketTypes.set(client.id, { type: 'patient', id: patientId });
                        console.log(`[Socket] Patient ${patientId} connected: ${client.id}`);
                    }
                }
            } else {
                // اتصال طبيب/إداري
                const userIdStr = query.userId as string;
                if (userIdStr) {
                    const userId = Number(userIdStr);
                    if (!isNaN(userId)) {
                        this.addUserSocket(userId, client.id);
                        this.socketTypes.set(client.id, { type: 'user', id: userId });
                        console.log(`[Socket] User ${userId} connected: ${client.id}`);
                    }
                }
            }
        } catch (e) {
            console.error('[Socket] Connection error:', e);
        }
    }

    handleDisconnect(client: Socket) {
        const info = this.socketTypes.get(client.id);
        if (info) {
            if (info.type === 'patient') {
                this.removePatientSocket(client.id);
            } else {
                this.removeUserSocket(client.id);
            }
            this.socketTypes.delete(client.id);
        } else {
            // fallback: بحث في كلا المجموعتين
            this.removeUserSocket(client.id);
            this.removePatientSocket(client.id);
        }
        console.log(`[Socket] Disconnected: ${client.id}`);
    }

    // ─── User (Doctor/Admin) Methods ───────────────────────────────────────────

    private addUserSocket(userId: number, socketId: string) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socketId);
    }

    private removeUserSocket(socketId: string) {
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.has(socketId)) {
                sockets.delete(socketId);
                if (sockets.size === 0) this.userSockets.delete(userId);
                break;
            }
        }
    }

    /** إرسال إشعار Real-time للطبيب/الإداري */
    sendNotificationToUser(userId: number, notification: any) {
        const sockets = this.userSockets.get(userId);
        if (sockets && sockets.size > 0) {
            sockets.forEach(socketId => {
                this.server.to(socketId).emit('notification', notification);
            });
            console.log(`[Socket] Sent to User ${userId} (${sockets.size} devices)`);
        } else {
            console.log(`[Socket] User ${userId} offline. Saved to DB only.`);
        }
    }

    // ─── Patient Methods ────────────────────────────────────────────────────────

    private addPatientSocket(patientId: number, socketId: string) {
        if (!this.patientSockets.has(patientId)) {
            this.patientSockets.set(patientId, new Set());
        }
        this.patientSockets.get(patientId)!.add(socketId);
    }

    private removePatientSocket(socketId: string) {
        for (const [patientId, sockets] of this.patientSockets.entries()) {
            if (sockets.has(socketId)) {
                sockets.delete(socketId);
                if (sockets.size === 0) this.patientSockets.delete(patientId);
                break;
            }
        }
    }

    /** إرسال إشعار Real-time للمريض */
    sendNotificationToPatient(patientId: number, notification: any) {
        const sockets = this.patientSockets.get(patientId);
        if (sockets && sockets.size > 0) {
            sockets.forEach(socketId => {
                this.server.to(socketId).emit('patient_notification', notification);
            });
            console.log(`[Socket] Sent to Patient ${patientId} (${sockets.size} devices)`);
        } else {
            console.log(`[Socket] Patient ${patientId} offline. Saved to DB only.`);
        }
    }

    // ─── Stats ──────────────────────────────────────────────────────────────────

    getConnectedUsersCount(): number {
        return this.userSockets.size;
    }

    getConnectedPatientsCount(): number {
        return this.patientSockets.size;
    }

    /** التحقق هل طبيب/مستخدم متصل حالياً */
    isUserOnline(userId: number): boolean {
        const sockets = this.userSockets.get(userId);
        return !!(sockets && sockets.size > 0);
    }

    isPatientOnline(patientId: number): boolean {
        const sockets = this.patientSockets.get(patientId);
        return !!(sockets && sockets.size > 0);
    }

    sendInternalMessage(targetType: 'doctor' | 'patient', targetId: number, payload: any) {
        if (targetType === 'doctor') {
            const sockets = this.userSockets.get(targetId);
            if (sockets && sockets.size > 0) {
                sockets.forEach(socketId => {
                    this.server.to(socketId).emit('internal_message', payload);
                });
                console.log(`[Socket] Internal msg -> Doctor ${targetId}`);
            }
        } else {
            const sockets = this.patientSockets.get(targetId);
            if (sockets && sockets.size > 0) {
                sockets.forEach(socketId => {
                    this.server.to(socketId).emit('internal_message', payload);
                });
                console.log(`[Socket] Internal msg -> Patient ${targetId}`);
            }
        }
    }
}

