import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule =
      await Test.createTestingModule({
        controllers: [AppController],
        providers: [
          {
            provide: PrismaService,
            useValue: {
              $queryRaw: jest
                .fn()
                .mockResolvedValue([
                  { '?column?': 1 },
                ]),
            },
          },
        ],
      }).compile();

    appController =
      app.get<AppController>(
        AppController,
      );
  });

  describe('health', () => {
    it('should return server and database status', async () => {
      const result =
        await appController.health();

      expect(result.server).toBe('ok');
      expect(result.database).toBe(
        'connected',
      );
      expect(result.timestamp).toBeDefined();
    });
  });
});