import { WhatsAppService } from './whatsapp.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

jest.mock('path', () => {
  const originalPath = jest.requireActual('path');
  return {
    ...originalPath,
    join: jest.fn((...args) => args.join('/')),
  };
});

describe('WhatsAppService Manual', () => {
  let service: WhatsAppService;
  let mockPrisma: any;
  let mockAi: any;
  let mockAppointments: any;

  beforeEach(() => {
    mockPrisma = {
      setting: { findMany: jest.fn(), upsert: jest.fn() },
      whatsAppChat: { findMany: jest.fn() },
      autoReplyTemplate: { findMany: jest.fn() },
    };
    mockAi = {};
    mockAppointments = {};

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Manual instantiation
    service = new WhatsAppService(mockPrisma as any, mockAi as any, mockAppointments as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should convert DB settings to an object map', async () => {
      const mockSettings = [
        { key: 'clinic_name', value: 'My Clinic' },
        { key: 'ai_enabled', value: '1' },
      ];
      mockPrisma.setting.findMany.mockResolvedValue(mockSettings);

      const result = await service.getSettings(1);
      expect(result).toEqual({
        clinic_name: 'My Clinic',
        ai_enabled: '1',
      });
    });
  });

  describe('updateSettings', () => {
    it('should call upsert for each setting provided', async () => {
      await service.updateSettings(1, { clinic_name: 'New' });
      expect(mockPrisma.setting.upsert).toHaveBeenCalled();
    });
  });
});
