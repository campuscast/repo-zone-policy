import { ZonesService } from './zones.service';

type MockZoneRepo = {
  findOne: jest.Mock;
  remove: jest.Mock;
  findAndCount: jest.Mock;
  save: jest.Mock;
  create: jest.Mock;
};

describe('ZonesService', () => {
  const originalFetch = global.fetch;

  let repo: MockZoneRepo;
  let service: ZonesService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      remove: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    service = new ZonesService(repo as any);
    (service as any).auditClient = { append: jest.fn() };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('remove triggers zone deletion and syncs zone deletion to device-management', async () => {
    repo.findOne.mockResolvedValue({
      zone_id: 'zone-1',
      name: 'Zone 1',
      description: '',
      groups: [],
    });
    repo.remove.mockResolvedValue(undefined);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 } as Response);

    const result = await service.remove('zone-1');

    expect(result).toEqual({ deleted: true });
    expect(repo.remove).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3004/devices/sync-zone',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
});
