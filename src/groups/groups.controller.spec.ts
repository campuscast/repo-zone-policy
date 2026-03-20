import { GroupsController } from './groups.controller';

describe('GroupsController', () => {
  const repo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  let controller: GroupsController;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
    controller = new GroupsController(repo as never);
  });

  it('saves screen group description on create', async () => {
    repo.create.mockImplementation((value) => value);
    repo.save.mockResolvedValue({
      group_id: 'group-1',
      zone_id: 'zone-1',
      name: 'Lobby',
      description: 'Main entry display',
    });

    const result = await controller.create('zone-1', {
      name: 'Lobby',
      description: '  Main entry display  ',
    });

    expect(repo.create).toHaveBeenCalledWith({
      zone_id: 'zone-1',
      name: 'Lobby',
      description: 'Main entry display',
    });
    expect(result.description).toBe('Main entry display');
  });
});
