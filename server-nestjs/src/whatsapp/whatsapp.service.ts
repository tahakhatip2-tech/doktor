import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  WAMessage,
  downloadMediaMessage,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import P from 'pino';

import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppService.name);
  private sockets = new Map<number, any>();
  private qrCodes = new Map<number, string>();
  private connectionStatus = new Map<number, boolean>();
  private sessionPath = path.join(process.cwd(), 'sessions');
  private readonly INDIVIDUAL_JID_SUFFIX = '@s.whatsapp.net';

  private isIndividualJid(jid: string): boolean {
    return jid?.endsWith(this.INDIVIDUAL_JID_SUFFIX) || jid?.endsWith('@lid');
  }

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private appointmentsService: AppointmentsService,
  ) {
    if (!fs.existsSync(this.sessionPath)) {
      fs.mkdirSync(this.sessionPath, { recursive: true });
    }
    const uploadsClinicPath = path.join(process.cwd(), 'uploads', 'clinic');
    if (!fs.existsSync(uploadsClinicPath)) {
      fs.mkdirSync(uploadsClinicPath, { recursive: true });
    }
  }

  // ... (keep existing methods up to extractAndProcessActions)

  async onModuleInit() {
    this.logger.log('Initializing WhatsApp sessions...');

    // Sync central GEMINI_API_KEY from .env to all users in DB
    await this.syncGeminiKeyToAllUsers();

    if (fs.existsSync(this.sessionPath)) {
      const folders = fs.readdirSync(this.sessionPath);
      for (const folder of folders) {
        if (folder.startsWith('user_')) {
          const userId = parseInt(folder.replace('user_', ''));
          if (!isNaN(userId)) {
            this.logger.log(`Resuming session for user ${userId}`);
            this.startSession(userId).catch((err) => {
              this.logger.error(
                `Failed to resume session for user ${userId}: ${err.message}`,
              );
            });
          }
        }
      }
    }
  }

  private async syncGeminiKeyToAllUsers() {
    const centralKey = process.env.GEMINI_API_KEY;
    if (!centralKey) {
      this.logger.warn(
        'GEMINI_API_KEY not found in .env — AI will not work until a key is set.',
      );
      return;
    }

    try {
      const users = await this.prisma.user.findMany({ select: { id: true } });
      for (const user of users) {
        await this.prisma.setting.upsert({
          where: { userId_key: { userId: user.id, key: 'ai_api_key' } },
          update: { value: centralKey },
          create: { userId: user.id, key: 'ai_api_key', value: centralKey },
        });
      }
      this.logger.log(
        `✅ Gemini API key synced to ${users.length} user(s) from .env`,
      );
    } catch (err) {
      this.logger.error(`Failed to sync Gemini key: ${err.message}`);
    }
  }

  async startSession(userId: number) {
    if (this.sockets.has(userId) && this.connectionStatus.get(userId)) {
      return { status: 'already_connected' };
    }

    const userSessionPath = path.join(this.sessionPath, `user_${userId}`);
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: P({ level: 'silent' }),
      browser: ['Al-Khatib SaaS', 'Chrome', '1.0.0'],
    });

    this.sockets.set(userId, sock);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.qrCodes.set(userId, qr);
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;
        this.connectionStatus.set(userId, false);
        if (shouldReconnect) {
          this.startSession(userId);
        } else {
          this.qrCodes.delete(userId);
          this.sockets.delete(userId);
          fs.rmSync(userSessionPath, { recursive: true, force: true });
        }
      } else if (connection === 'open') {
        this.connectionStatus.set(userId, true);
        this.qrCodes.delete(userId);
        this.logger.log(`WhatsApp connected for user ${userId}`);
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      console.log(
        `[WhatsApp Debug] Received 'messages.upsert' event. Type: ${type}, Count: ${messages.length}`,
      );

      for (const msg of messages) {
        console.log(`[WhatsApp Debug] Raw Message:`, JSON.stringify(msg.key));

        if (!msg.key.fromMe && type === 'notify') {
          console.log(
            `[WhatsApp Debug] Processing incoming message from ${msg.key.remoteJid}`,
          );
          await this.handleMessage(userId, msg);
        } else {
          console.log(
            `[WhatsApp Debug] Skipped message. fromMe: ${msg.key.fromMe}, type: ${type}`,
          );
        }
      }
    });

    return { status: 'initializing' };
  }

  async getStatus(userId: number) {
    return {
      connected: this.connectionStatus.get(userId) || false,
      qrCode: this.qrCodes.get(userId) || null,
    };
  }

  async logout(userId: number) {
    const sock = this.sockets.get(userId);
    if (sock) {
      await sock.logout();
      this.sockets.delete(userId);
      this.connectionStatus.delete(userId);
      this.qrCodes.delete(userId);
      const userSessionPath = path.join(this.sessionPath, `user_${userId}`);
      if (fs.existsSync(userSessionPath)) {
        fs.rmSync(userSessionPath, { recursive: true, force: true });
      }
    }
  }

  async getSettings(userId: number) {
    const settings = await this.prisma.setting.findMany({
      where: { userId },
    });

    // Convert array of settings to an object
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return settingsMap;
  }

  async updateSettings(userId: number, data: any) {
    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      if (value === undefined || value === null) continue;

      await this.prisma.setting.upsert({
        where: { userId_key: { userId, key } },
        update: { value: value.toString() },
        create: { userId, key, value: value.toString() },
      });
    }

    return { success: true };
  }

  async getChats(userId: number) {
    return this.prisma.whatsAppChat.findMany({
      where: { userId },
      orderBy: { lastMessageTime: 'desc' },
    });
  }

  async deleteChat(chatId: number, userId: number) {
    // First delete all messages associated with this chat
    await this.prisma.whatsAppMessage.deleteMany({
      where: { chatId },
    });

    // Then delete the chat itself
    return this.prisma.whatsAppChat.deleteMany({
      where: {
        id: chatId,
        userId: userId, // Security check to ensure user owns the chat
      },
    });
  }

  async getMessages(chatId: number, userId: number) {
    // Verify chat ownership
    const chat = await this.prisma.whatsAppChat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    return this.prisma.whatsAppMessage.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async sendMessage(
    userId: number,
    data: {
      phone: string;
      message: string;
      mediaUrl?: string;
      mediaType?: string;
    },
  ) {
    const sock = this.sockets.get(userId);
    if (!sock) throw new Error('WhatsApp not connected');

    const { phone, message, mediaUrl, mediaType } = data;
    if (!this.isIndividualJid(phone)) {
      this.logger.warn(`Skipping sendMessage for non-individual JID: ${phone}`);
      return null;
    }
    let sentMsg;

    if (mediaUrl) {
      // For local files, we need to read them as Buffer
      const mediaOptions: any = {};

      try {
        // Check if it's a local file path
        const isLocalFile = !mediaUrl.startsWith('http');

        if (isLocalFile) {
          // Read file as buffer for local files
          const fileBuffer = fs.readFileSync(mediaUrl);
          const fileName = path.basename(mediaUrl);

          if (mediaType === 'image') {
            mediaOptions.image = fileBuffer;
          } else if (mediaType === 'video') {
            mediaOptions.video = fileBuffer;
          } else if (mediaType === 'document') {
            mediaOptions.document = fileBuffer;
            mediaOptions.mimetype = 'application/pdf';
            mediaOptions.fileName = fileName;
          }
        } else {
          // For remote URLs
          if (mediaType === 'image') mediaOptions.image = { url: mediaUrl };
          else if (mediaType === 'video')
            mediaOptions.video = { url: mediaUrl };
          else if (mediaType === 'document') {
            mediaOptions.document = { url: mediaUrl };
            mediaOptions.mimetype = 'application/pdf';
            mediaOptions.fileName = path.basename(mediaUrl);
          }
        }

        sentMsg = await sock.sendMessage(phone, {
          ...mediaOptions,
          caption: message,
        });
        this.logger.log(`[WhatsApp] Sent ${mediaType} to ${phone}`);
      } catch (error) {
        this.logger.error(`[WhatsApp] Failed to send media: ${error.message}`);
        throw new Error(`Failed to send media: ${error.message}`);
      }
    } else {
      sentMsg = await sock.sendMessage(phone, { text: message });
    }

    // Save to DB
    const chat = await this.prisma.whatsAppChat.upsert({
      where: { userId_phone: { userId, phone } },
      update: {
        lastMessage: message,
        lastMessageTime: new Date().toISOString(),
      },
      create: {
        userId,
        phone,
        name: phone,
        lastMessage: message,
        lastMessageTime: new Date().toISOString(),
        status: 'active',
      },
    });

    await this.prisma.whatsAppMessage.create({
      data: {
        chatId: chat.id,
        messageId: sentMsg?.key?.id,
        fromMe: true,
        content: message,
        timestamp: new Date(),
        status: 'sent',
      },
    });

    return sentMsg;
  }

  async markRead(chatId: number, userId: number) {
    // Verify ownership
    const chat = await this.prisma.whatsAppChat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    await this.prisma.whatsAppChat.update({
      where: { id: chatId },
      data: { unreadCount: 0 },
    });
    return { success: true };
  }

  // Templates
  async getTemplates(userId: number) {
    return this.prisma.autoReplyTemplate.findMany({
      where: { userId },
      orderBy: { priority: 'asc' },
    });
  }

  async createTemplate(userId: number, data: any) {
    return this.prisma.autoReplyTemplate.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateTemplate(id: number, userId: number, data: any) {
    // Verify ownership
    const template = await this.prisma.autoReplyTemplate.findFirst({
      where: { id, userId },
    });

    if (!template) {
      throw new Error('Template not found or access denied');
    }

    const updateData = { ...data };
    if (data.is_active !== undefined) {
      updateData.isActive = data.is_active === 1 || data.is_active === true;
      delete updateData.is_active;
    }

    return this.prisma.autoReplyTemplate.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteTemplate(id: number, userId: number) {
    // Verify ownership
    const template = await this.prisma.autoReplyTemplate.findFirst({
      where: { id, userId },
    });

    if (!template) {
      throw new Error('Template not found or access denied');
    }

    return this.prisma.autoReplyTemplate.delete({ where: { id } });
  }

  async getAnalytics(userId: number) {
    // This is a bit complex as logs might not have userId directly if they are just logs
    // But we can filter logs by templates owned by user?
    // Or we should add userId to logs.
    // For now, let's return limited analytics or assume logs are global/not significant yet.
    // Better: We should probably add userId to WhatsAppLog or link via template.
    // Let's assume for now we only count messages for chats owned by user.

    // Count auto-replies triggered by this user's templates
    const autoReplies = await this.prisma.whatsAppLog.count({
      where: {
        template: {
          userId,
        },
      },
    });

    const incoming = await this.prisma.whatsAppMessage.count({
      where: {
        chat: { userId },
        fromMe: false,
      },
    });

    const outgoing = await this.prisma.whatsAppMessage.count({
      where: {
        chat: { userId },
        fromMe: true,
      },
    });

    const topTriggers = await this.prisma.$queryRaw`
            SELECT t.trigger, CAST(COUNT(l.id) AS TEXT) as count
            FROM "AutoReplyTemplate" t
            JOIN "WhatsAppLog" l ON t.id = l."triggerId"
            WHERE t."userId" = ${userId}
            GROUP BY t.id, t.trigger
            ORDER BY count DESC
            LIMIT 5
        `;

    return {
      stats: {
        auto_replies: autoReplies,
        incoming_messages: incoming,
        outgoing_messages: outgoing,
      },
      topTriggers,
    };
  }

  // Tags
  async getTags(userId: number) {
    return this.prisma.customerTag.findMany({ where: { userId } });
  }

  async getContactTags(phone: string, userId: number) {
    const contact = await this.prisma.contact.findFirst({
      where: { phone, userId },
      include: { tags: true },
    });
    return contact?.tags || [];
  }

  async addContactTag(phone: string, tagId: number, userId: number) {
    // Find contact or create one
    let contact = await this.prisma.contact.findFirst({
      where: { phone, userId },
    });
    if (!contact) {
      // Create contact if not exists for this user?
      // Or fail. Let's create for now as tagging implies interest.
      contact = await this.prisma.contact.create({
        data: {
          userId,
          phone,
          name: phone, // Default name
          status: 'active',
          platform: 'whatsapp',
        },
      });
    }

    // Verify tag ownership
    const tag = await this.prisma.customerTag.findFirst({
      where: { id: tagId, userId },
    });
    if (!tag) return { error: 'Tag not found' };

    await this.prisma.contact.update({
      where: { id: contact.id },
      data: {
        tags: { connect: { id: tagId } },
      },
    });
    return { success: true };
  }

  async removeContactTag(phone: string, tagId: number, userId: number) {
    const contact = await this.prisma.contact.findFirst({
      where: { phone, userId },
    });
    if (!contact) return { error: 'Contact not found' };

    await this.prisma.contact.update({
      where: { id: contact.id },
      data: {
        tags: { disconnect: { id: tagId } },
      },
    });
    return { success: true };
  }

  private async handleMessage(userId: number, msg: WAMessage) {
    const sock = this.sockets.get(userId);
    if (!sock) return;

    let from = msg.key.remoteJid;
    // Check for LID and use alternate JID (phone number) if available to avoid duplicates
    const keyAny = msg.key as any;
    if (from?.endsWith('@lid') && keyAny.remoteJidAlt) {
      this.logger.log(
        `[WhatsApp] Normalizing LID ${from} to ${keyAny.remoteJidAlt}`,
      );
      from = keyAny.remoteJidAlt;
    }

    if (!from || !this.isIndividualJid(from)) return;

    const messageContent =
      msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!messageContent) return;

    this.logger.log(
      `Message from ${from} for user ${userId}: ${messageContent}`,
    );

    // 1. Save or Update Chat
    let chat = await this.prisma.whatsAppChat.findUnique({
      where: { userId_phone: { userId, phone: from } },
    });

    if (!chat) {
      chat = await this.prisma.whatsAppChat.create({
        data: {
          userId,
          phone: from,
          name: msg.pushName || 'New Contact',
          lastMessage: messageContent,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 1,
          status: 'active',
        },
      });
    } else {
      chat = await this.prisma.whatsAppChat.update({
        where: { id: chat.id },
        data: {
          lastMessage: messageContent,
          lastMessageTime: new Date().toISOString(),
          unreadCount: { increment: 1 },
        },
      });
    }

    // 2. Save Message
    await this.prisma.whatsAppMessage.create({
      data: {
        chatId: chat.id,
        messageId: msg.key.id,
        fromMe: false,
        content: messageContent,
        timestamp: new Date(),
        status: 'received',
      },
    });

    // 3. AI Reply (Conditional on settings)
    const settings = await this.getSettings(userId);
    if (settings['ai_enabled'] === '1') {
      const contactName = chat.name || msg.pushName || 'Client';
      const aiResponseRaw = await this.aiService.getAIResponse(
        userId,
        messageContent,
        from,
        contactName,
      );
      if (aiResponseRaw) {
        // Process Actions (like Appointments)
        const aiResponse = await this.extractAndProcessActions(
          userId,
          aiResponseRaw,
          from,
        );

        try {
          await sock.sendMessage(from, { text: aiResponse });

          // Save outgoing message
          await this.prisma.whatsAppMessage.create({
            data: {
              chatId: chat.id,
              fromMe: true,
              content: aiResponse,
              timestamp: new Date(),
              status: 'sent',
            },
          });
        } catch (error) {
          this.logger.error(
            `Failed to send AI response to ${from}: ${error.message}`,
          );
          // Optionally try to reconnect or just log
        }
      }
    }
  }

  private async extractAndProcessActions(
    userId: number,
    text: string,
    phone: string,
  ): Promise<string> {
    let processedText = text;

    // 1. Appointment Extraction: [[APPOINTMENT: YYYY-MM-DD | HH:MM | Name | Notes]]
    const appointmentRegex =
      /\[\[APPOINTMENT:\s*([^|]*)?\|\s*([^|]*)?\|\s*([^|]*)?\|\s*([^\]]*)?\]\]/g;
    let match;

    while ((match = appointmentRegex.exec(text)) !== null) {
      const [fullMatch, dateStr, timeStr, name, notes] = match;

      try {
        const date = dateStr?.trim();
        const time = timeStr?.trim();
        const customerName = name?.trim() || 'Unspecified';
        const appointmentNotes = (notes?.trim() || '') + ' [BOT]';

        if (date && time) {
          let finalDateStr = date;
          let finalTimeStr = time;

          // Support "2:00 PM" or "2:00 ظهراً" by trying to normalize
          if (
            time.includes('PM') ||
            time.includes('م') ||
            time.includes('ظهراً') ||
            time.includes('عصراً') ||
            time.includes('مساءً')
          ) {
            let [h, m] = time.replace(/[^\d:]/g, '').split(':');
            let hour = parseInt(h);
            if (hour < 12) hour += 12;
            finalTimeStr = `${hour.toString().padStart(2, '0')}:${m || '00'}`;
          }

          const appointmentDate = new Date(
            `${finalDateStr}T${finalTimeStr}:00`,
          );

          if (!isNaN(appointmentDate.getTime())) {
            this.logger.log(
              `[AI Action] Attempting to book: ${customerName} | ${appointmentDate.toISOString()}`,
            );

            // SAFETY CHECK: Verify availability before booking
            const isAvailable = await this.appointmentsService.isSlotAvailable(
              userId,
              appointmentDate,
              30,
            );
            if (!isAvailable) {
              this.logger.warn(
                `[AI Action] Slot ${appointmentDate} is busy or invalid.`,
              );
              processedText = processedText.replace(
                fullMatch,
                '\n\n(ملاحظة: عذراً، هذا الموعد غير متاح حالياً. يرجى اختيار وقت آخر)',
              );
              continue;
            }

            const contact = await this.prisma.contact.upsert({
              where: { userId_phone: { userId, phone } },
              update: { status: 'active', name: customerName },
              create: {
                userId,
                phone,
                name: customerName,
                platform: 'whatsapp',
                status: 'active',
              },
            });

            // 1. Clean phone number
            let cleanPhone = phone.split('@')[0];
            if (cleanPhone.startsWith('962')) {
              cleanPhone = '0' + cleanPhone.substring(3);
            }

            // 2. Check or create Patient portal account
            let patientUser = await this.prisma.patient.findUnique({
              where: { phone: cleanPhone },
            });

            let newlyCreatedPatient = false;
            if (!patientUser) {
              const hashedPassword = await bcrypt.hash(cleanPhone, 10);
              patientUser = await this.prisma.patient.create({
                data: {
                  email: `${cleanPhone}@hakeem.jo`,
                  password: hashedPassword,
                  fullName: customerName,
                  phone: cleanPhone,
                },
              });
              newlyCreatedPatient = true;
            }

            await this.prisma.appointment.create({
              data: {
                userId,
                patientId: contact.id,
                patientUserId: patientUser.id,
                phone,
                customerName,
                appointmentDate,
                notes: appointmentNotes,
                status: 'confirmed',
              },
            });

            // ─── إشعار للطبيب في لوحة التحكم ─────────────────────────────────
            await this.prisma.notification.create({
              data: {
                userId,
                type: 'NEW_APPOINTMENT',
                title: 'موعد جديد عبر واتساب',
                message: `تم حجز موعد لـ ${customerName} في ${appointmentDate.toLocaleString('ar-EG')} عبر الموظف الآلي`,
                priority: 'HIGH',
              },
            }).catch(e => this.logger.error(`Failed to create doctor notification: ${e.message}`));

            // ─── إشعار للمريض في بوابة المرضى ────────────────────────────────
            await this.prisma.patientNotification.create({
              data: {
                patientId: patientUser.id,
                type: 'appointment_created',
                title: 'تم تأكيد موعدك',
                message: `تم حجز موعدك في ${appointmentDate.toLocaleString('ar-EG')} بنجاح عبر واتساب`,
              },
            }).catch(e => this.logger.error(`Failed to create patient notification: ${e.message}`));

            if (newlyCreatedPatient) {
              processedText = processedText.replace(
                fullMatch,
                '\n\n(تم حجز الموعد بنجاح. لقد أنشأنا لك حساباً في بوابة المرضى لمتابعة مواعيدك. يمكنك الدخول للموقع واستخدام رقم هاتفك كاسم مستخدم وكلمة مرور للمرة الأولى)',
              );
            }

            // Append success message override if needed
          }
        }
      } catch (err) {
        this.logger.error(`Failed to process appointment tag: ${err.message}`);
        // fullMatch is safe here because we are still inside the while loop
        processedText = processedText.replace(
          fullMatch,
          'حدث خطأ أثناء حجز الموعد: ' + err.message,
        );
      }

      // Replace the tag after processing
      if (processedText.includes(fullMatch)) {
        processedText = processedText.replace(fullMatch, '');
      }
    } // End of while loop

    return processedText.trim();
  }

  onModuleDestroy() {
    for (const [userId, sock] of this.sockets) {
      sock.end();
    }
  }
}
