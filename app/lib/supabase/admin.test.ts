import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAdminClient, adminUserOperations, ASSIGNABLE_ROLES } from './admin';

// Mock environment variables
const mockEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_SERVICE_ROLE_KEY: 'service-role-key'
};

// Mock user data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: { roles: ['user'] },
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockUsers = [
  mockUser,
  {
    id: 'admin-123',
    email: 'admin@example.com',
    app_metadata: { roles: ['user', 'admin'] },
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Mock Supabase admin client
const mockAdminAuth = {
  listUsers: vi.fn(),
  updateUserById: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
};

const mockAdminClient = {
  auth: {
    admin: mockAdminAuth
  }
};

// Mock the createClient function from Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockAdminClient)
}));

// Mock loglevel
vi.mock('loglevel', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }
}));

describe('createAdminClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    process.env.VITE_SUPABASE_URL = mockEnv.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = mockEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create admin client with valid environment variables', () => {
    const client = createAdminClient();
    expect(client).toBeDefined();
  });

  it('should throw error when VITE_SUPABASE_URL is missing', () => {
    delete process.env.VITE_SUPABASE_URL;
    
    expect(() => createAdminClient()).toThrow(
      'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY'
    );
  });

  it('should throw error when VITE_SUPABASE_SERVICE_ROLE_KEY is missing', () => {
    delete process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    expect(() => createAdminClient()).toThrow(
      'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY'
    );
  });

  it('should throw error when both environment variables are missing', () => {
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    expect(() => createAdminClient()).toThrow(
      'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY'
    );
  });
});

describe('adminUserOperations.getAllUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = mockEnv.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = mockEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should successfully fetch all users', async () => {
    mockAdminAuth.listUsers.mockResolvedValue({
      data: { users: mockUsers },
      error: null
    });

    const result = await adminUserOperations.getAllUsers();
    
    expect(mockAdminAuth.listUsers).toHaveBeenCalledOnce();
    expect(result).toEqual(mockUsers);
  });

  it('should throw error when Supabase returns error', async () => {
    const error = { message: 'Database connection failed' };
    mockAdminAuth.listUsers.mockResolvedValue({
      data: null,
      error
    });

    await expect(adminUserOperations.getAllUsers()).rejects.toThrow(
      'Failed to fetch users: Database connection failed'
    );
  });
});

describe('adminUserOperations.updateUserRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = mockEnv.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = mockEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should successfully update user roles with valid roles', async () => {
    const updatedUser = { ...mockUser, app_metadata: { roles: ['user', 'admin'] } };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: { user: updatedUser },
      error: null
    });

    const result = await adminUserOperations.updateUserRoles('user-123', ['admin']);
    
    expect(mockAdminAuth.updateUserById).toHaveBeenCalledWith('user-123', {
      app_metadata: { roles: ['user', 'admin'] }
    });
    expect(result).toEqual(updatedUser);
  });

  it('should add user role automatically if not provided', async () => {
    const updatedUser = { ...mockUser, app_metadata: { roles: ['user', 'editor'] } };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: { user: updatedUser },
      error: null
    });

    await adminUserOperations.updateUserRoles('user-123', ['editor']);
    
    expect(mockAdminAuth.updateUserById).toHaveBeenCalledWith('user-123', {
      app_metadata: { roles: ['user', 'editor'] }
    });
  });

  it('should handle user role being explicitly provided', async () => {
    const updatedUser = { ...mockUser, app_metadata: { roles: ['user', 'admin'] } };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: { user: updatedUser },
      error: null
    });

    await adminUserOperations.updateUserRoles('user-123', ['user', 'admin']);
    
    expect(mockAdminAuth.updateUserById).toHaveBeenCalledWith('user-123', {
      app_metadata: { roles: ['user', 'admin'] }
    });
  });

  it('should throw error for invalid roles', async () => {
    await expect(
      adminUserOperations.updateUserRoles('user-123', ['invalid-role'])
    ).rejects.toThrow('Invalid roles: invalid-role');
  });

  it('should throw error for multiple invalid roles', async () => {
    await expect(
      adminUserOperations.updateUserRoles('user-123', ['invalid1', 'invalid2'])
    ).rejects.toThrow('Invalid roles: invalid1, invalid2');
  });

  it('should accept valid assignable roles', async () => {
    const updatedUser = { ...mockUser, app_metadata: { roles: ['user', 'admin', 'editor'] } };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: { user: updatedUser },
      error: null
    });

    await adminUserOperations.updateUserRoles('user-123', ['admin', 'editor']);
    
    expect(mockAdminAuth.updateUserById).toHaveBeenCalledWith('user-123', {
      app_metadata: { roles: ['user', 'admin', 'editor'] }
    });
  });

  it('should throw error when Supabase returns error', async () => {
    const error = { message: 'Update failed' };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: null,
      error
    });

    await expect(
      adminUserOperations.updateUserRoles('user-123', ['admin'])
    ).rejects.toThrow('Failed to update user roles: Update failed');
  });
});

describe('adminUserOperations.getUserById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = mockEnv.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = mockEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should successfully fetch user by ID', async () => {
    mockAdminAuth.getUserById.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const result = await adminUserOperations.getUserById('user-123');
    
    expect(mockAdminAuth.getUserById).toHaveBeenCalledWith('user-123');
    expect(result).toEqual(mockUser);
  });

  it('should throw error when Supabase returns error', async () => {
    const error = { message: 'User not found' };
    mockAdminAuth.getUserById.mockResolvedValue({
      data: null,
      error
    });

    await expect(adminUserOperations.getUserById('user-123')).rejects.toThrow(
      'Failed to fetch user: User not found'
    );
  });
});

describe('adminUserOperations.disableUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = mockEnv.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = mockEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should successfully disable user', async () => {
    const disabledUser = { ...mockUser, ban_duration: '87600h' };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: { user: disabledUser },
      error: null
    });

    const result = await adminUserOperations.disableUser('user-123');
    
    expect(mockAdminAuth.updateUserById).toHaveBeenCalledWith('user-123', {
      ban_duration: '87600h'
    });
    expect(result).toEqual(disabledUser);
  });

  it('should throw error when Supabase returns error', async () => {
    const error = { message: 'Failed to ban user' };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: null,
      error
    });

    await expect(adminUserOperations.disableUser('user-123')).rejects.toThrow(
      'Failed to disable user: Failed to ban user'
    );
  });
});

describe('adminUserOperations.enableUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = mockEnv.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = mockEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should successfully enable user', async () => {
    const enabledUser = { ...mockUser, ban_duration: 'none' };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: { user: enabledUser },
      error: null
    });

    const result = await adminUserOperations.enableUser('user-123');
    
    expect(mockAdminAuth.updateUserById).toHaveBeenCalledWith('user-123', {
      ban_duration: 'none'
    });
    expect(result).toEqual(enabledUser);
  });

  it('should throw error when Supabase returns error', async () => {
    const error = { message: 'Failed to unban user' };
    mockAdminAuth.updateUserById.mockResolvedValue({
      data: null,
      error
    });

    await expect(adminUserOperations.enableUser('user-123')).rejects.toThrow(
      'Failed to enable user: Failed to unban user'
    );
  });
});

describe('adminUserOperations.createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = mockEnv.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = mockEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should successfully create user with email and password', async () => {
    // Mock existing user check
    mockAdminAuth.listUsers.mockResolvedValue({
      data: { users: [] },
      error: null
    });

    const newUser = {
      id: 'new-user-123',
      email: 'new@example.com',
      app_metadata: { roles: ['user'] },
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockAdminAuth.createUser.mockResolvedValue({
      data: { user: newUser },
      error: null
    });

    const result = await adminUserOperations.createUser('new@example.com', 'password123');
    
    expect(mockAdminAuth.createUser).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      email_confirm: true
    });
    expect(result).toEqual(newUser);
  });

  it('should throw error when user already exists in listUsers check', async () => {
    mockAdminAuth.listUsers.mockResolvedValue({
      data: { users: [{ email: 'existing@example.com' }] },
      error: null
    });

    // The createUser won't be called since the function throws before reaching it
    await expect(
      adminUserOperations.createUser('existing@example.com', 'password123')
    ).rejects.toThrow('A user with email existing@example.com already exists');

    expect(mockAdminAuth.createUser).not.toHaveBeenCalled();
  });

  it('should continue with creation if listUsers check fails', async () => {
    // Mock existing user check failure
    mockAdminAuth.listUsers.mockResolvedValue({
      data: null,
      error: { message: 'List users failed' }
    });

    const newUser = {
      id: 'new-user-123',
      email: 'new@example.com',
      app_metadata: { roles: ['user'] },
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockAdminAuth.createUser.mockResolvedValue({
      data: { user: newUser },
      error: null
    });

    const result = await adminUserOperations.createUser('new@example.com', 'password123');
    
    expect(mockAdminAuth.createUser).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      email_confirm: true
    });
    expect(result).toEqual(newUser);
  });

  it('should throw specific error for duplicate user from createUser', async () => {
    mockAdminAuth.listUsers.mockResolvedValue({
      data: { users: [] },
      error: null
    });

    const error = { message: 'User already exists', status: 422 };
    mockAdminAuth.createUser.mockResolvedValue({
      data: null,
      error
    });

    await expect(
      adminUserOperations.createUser('existing@example.com', 'password123')
    ).rejects.toThrow('A user with email existing@example.com already exists');
  });

  it('should throw specific error for duplicate key error', async () => {
    mockAdminAuth.listUsers.mockResolvedValue({
      data: { users: [] },
      error: null
    });

    const error = { message: 'duplicate key value violates unique constraint' };
    mockAdminAuth.createUser.mockResolvedValue({
      data: null,
      error
    });

    await expect(
      adminUserOperations.createUser('duplicate@example.com', 'password123')
    ).rejects.toThrow('A user with email duplicate@example.com already exists');
  });

  it('should throw generic error for other createUser failures', async () => {
    mockAdminAuth.listUsers.mockResolvedValue({
      data: { users: [] },
      error: null
    });

    const error = { message: 'Database connection failed' };
    mockAdminAuth.createUser.mockResolvedValue({
      data: null,
      error
    });

    await expect(
      adminUserOperations.createUser('test@example.com', 'password123')
    ).rejects.toThrow('Failed to create user: Database connection failed');
  });

  it('should handle createUser error without message', async () => {
    mockAdminAuth.listUsers.mockResolvedValue({
      data: { users: [] },
      error: null
    });

    const error = { status: 500 };
    mockAdminAuth.createUser.mockResolvedValue({
      data: null,
      error
    });

    await expect(
      adminUserOperations.createUser('test@example.com', 'password123')
    ).rejects.toThrow('Failed to create user: Database error');
  });
});

describe('adminUserOperations.deleteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = mockEnv.VITE_SUPABASE_URL;
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = mockEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should successfully delete disabled user', async () => {
    const disabledUser = {
      ...mockUser,
      banned_until: new Date(Date.now() + 1000000).toISOString()
    };

    mockAdminAuth.getUserById.mockResolvedValue({
      data: { user: disabledUser },
      error: null
    });

    mockAdminAuth.deleteUser.mockResolvedValue({
      error: null
    });

    const result = await adminUserOperations.deleteUser('user-123');
    
    expect(mockAdminAuth.getUserById).toHaveBeenCalledWith('user-123');
    expect(mockAdminAuth.deleteUser).toHaveBeenCalledWith('user-123');
    expect(result).toEqual({ success: true });
  });

  it('should throw error when trying to delete enabled user', async () => {
    const enabledUser = { ...mockUser }; // No banned_until field

    mockAdminAuth.getUserById.mockResolvedValue({
      data: { user: enabledUser },
      error: null
    });

    await expect(adminUserOperations.deleteUser('user-123')).rejects.toThrow(
      'Can only delete disabled users. Please disable the user first.'
    );

    expect(mockAdminAuth.deleteUser).not.toHaveBeenCalled();
  });

  it('should throw error when trying to delete user with expired ban', async () => {
    const userWithExpiredBan = {
      ...mockUser,
      banned_until: new Date(Date.now() - 1000000).toISOString() // Past date
    };

    mockAdminAuth.getUserById.mockResolvedValue({
      data: { user: userWithExpiredBan },
      error: null
    });

    await expect(adminUserOperations.deleteUser('user-123')).rejects.toThrow(
      'Can only delete disabled users. Please disable the user first.'
    );
  });

  it('should throw error when getUserById fails', async () => {
    const error = { message: 'User not found' };
    mockAdminAuth.getUserById.mockResolvedValue({
      data: null,
      error
    });

    await expect(adminUserOperations.deleteUser('user-123')).rejects.toThrow(
      'Failed to fetch user: User not found'
    );

    expect(mockAdminAuth.deleteUser).not.toHaveBeenCalled();
  });

  it('should throw error when deleteUser fails', async () => {
    const disabledUser = {
      ...mockUser,
      banned_until: new Date(Date.now() + 1000000).toISOString()
    };

    mockAdminAuth.getUserById.mockResolvedValue({
      data: { user: disabledUser },
      error: null
    });

    const deleteError = { message: 'Delete operation failed' };
    mockAdminAuth.deleteUser.mockResolvedValue({
      error: deleteError
    });

    await expect(adminUserOperations.deleteUser('user-123')).rejects.toThrow(
      'Failed to delete user: Delete operation failed'
    );
  });
});

describe('ASSIGNABLE_ROLES constant', () => {
  it('should contain the correct assignable roles', () => {
    expect(ASSIGNABLE_ROLES).toEqual(['admin', 'editor']);
  });

  it('should be available for type checking', () => {
    // This tests that the type is properly exported and usable
    const testRole: (typeof ASSIGNABLE_ROLES)[number] = 'admin';
    expect(testRole).toBe('admin');
  });
});