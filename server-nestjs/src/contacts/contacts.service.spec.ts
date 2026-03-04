import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContactsService', () => {
  let service: ContactsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    contact: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    whatsAppChat: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return contacts with mapped fields', async () => {
      const mockContacts = [
        {
          id: 1,
          userId: 1,
          status: 'active',
          appointment: [{ appointmentDate: new Date() }],
          _count: { appointment: 1 },
          tags: [],
        },
      ];

      mockPrismaService.contact.findMany.mockResolvedValue(mockContacts);

      const result = await service.findAll(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('total_appointments');
      expect(result[0]).toHaveProperty('last_visit');
      expect(result[0]).toHaveProperty('patient_status');
      expect(prismaService.contact.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a contact', async () => {
      const contactData = { name: 'Test Patient', phone: '123456789' };
      mockPrismaService.contact.create.mockResolvedValue({ id: 1, ...contactData, userId: 1 });

      const result = await service.create(1, contactData);

      expect(result.id).toBe(1);
      expect(prismaService.contact.create).toHaveBeenCalledWith({
        data: { ...contactData, userId: 1 },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single contact', async () => {
      const mockContact = { id: 1, userId: 1, name: 'Test' };
      mockPrismaService.contact.findFirst.mockResolvedValue(mockContact);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockContact);
      expect(prismaService.contact.findFirst).toHaveBeenCalled();
    });
  });

  describe('syncFromWhatsApp', () => {
    it('should sync contacts from WhatsApp chats', async () => {
      const mockChats = [
        { phone: '123', name: 'User 1' },
        { phone: '456', name: 'User 2' },
      ];

      mockPrismaService.whatsAppChat.findMany.mockResolvedValue(mockChats);
      mockPrismaService.contact.upsert.mockResolvedValue({});

      const result = await service.syncFromWhatsApp(1);

      expect(result.synced).toBe(2);
      expect(prismaService.whatsAppChat.findMany).toHaveBeenCalled();
      expect(prismaService.contact.upsert).toHaveBeenCalledTimes(2);
    });

    it('should skip chats without a phone number', async () => {
      const mockChats = [{ phone: null, name: 'Invalid' }];
      mockPrismaService.whatsAppChat.findMany.mockResolvedValue(mockChats);

      const result = await service.syncFromWhatsApp(1);

      expect(result.synced).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete a contact', async () => {
      mockPrismaService.contact.delete.mockResolvedValue({ id: 1 });

      const result = await service.delete(1, 1);

      expect(result.id).toBe(1);
      expect(prismaService.contact.delete).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
    });
  });
});
