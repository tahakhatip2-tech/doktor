import { PrismaClient } from '@prisma/client';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';
import * as path from 'path';
import * as fs from 'fs';
import P from 'pino';

async function main() {
    const userId = 1;
    const phone = '962797242270@s.whatsapp.net';
    const message = 'مرحبا، أنا النظام الذكي حكيم. هل وصلتك هذه الرسالة؟ 🤖';

    console.log(`Connecting session for user ${userId}...`);

    const sessionPath = path.join(process.cwd(), 'sessions', `user_${userId}`);
    if (!fs.existsSync(sessionPath)) {
        console.error('Session not found! Please connect WhatsApp first.');
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('✅ Connected! Sending message...');

            try {
                await sock.sendMessage(phone, { text: message });
                console.log(`✅ Message sent to ${phone}`);

                // Wait a bit then close
                setTimeout(() => {
                    sock.end(undefined);
                    process.exit(0);
                }, 2000);
            } catch (error) {
                console.error('❌ Failed to send message:', error);
                process.exit(1);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                // simple reconnect logic just for test script is not needed usually as we exit on success
            }
        }
    });

    // Handle authentication failure
    setTimeout(() => {
        console.log('Timeout waiting for connection...');
        process.exit(1);
    }, 20000);
}

main();
