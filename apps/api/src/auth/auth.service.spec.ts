import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

const mockPrisma = {
  user: { findUnique: jest.fn(), create: jest.fn() },
  refreshToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token'), verify: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('secret') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', name: 'Test', role: 'STUDENT', passwordHash: 'hash', bio: null, avatarUrl: null, createdAt: new Date(), updatedAt: new Date() });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({ email: 'test@test.com', name: 'Test', password: 'password123' });
      expect(result.user.email).toBe('test@test.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1' });
      await expect(service.register({ email: 'test@test.com', name: 'Test', password: 'pass' })).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'bad@test.com', password: 'pass' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', passwordHash: await argon2.hash('correctpass'), role: 'STUDENT', email: 'a@a.com' });
      await expect(service.login({ email: 'a@a.com', password: 'wrongpass' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
