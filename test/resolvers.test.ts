import resolvers from '../src/resolvers';

describe('Resolvers', () => {
  const mockDataSources = {
    stackBlitzAPI: {
      getNodeById: jest.fn(),
      getProjects: jest.fn(),
      getProjectById: jest.fn(),
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      createProject: jest.fn(),
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      forkProject: jest.fn(),
      getUserProjects: jest.fn()
    }
  };

  const mockContext = {
    dataSources: mockDataSources
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query resolvers', () => {
    it('should resolve node query', async () => {
      const mockNode = { id: 'node1', type: 'Project' };
      mockDataSources.stackBlitzAPI.getNodeById.mockResolvedValue(mockNode);
      
      const result = await resolvers.Query?.node?.(
        {},
        { id: 'node1' },
        mockContext,
        {} as any
      );
      
      expect(mockDataSources.stackBlitzAPI.getNodeById).toHaveBeenCalledWith('node1');
      expect(result).toEqual(mockNode);
    });

    it('should resolve projects query', async () => {
      const mockProjects = {
        edges: [{ cursor: '1', node: { id: 'proj1' } }],
        pageInfo: { hasNextPage: false }
      };
      mockDataSources.stackBlitzAPI.getProjects.mockResolvedValue(mockProjects);
      
      const result = await resolvers.Query?.projects?.(
        {},
        { filters: { tag: 'react' }, pagination: { first: 10 } },
        mockContext,
        {} as any
      );
      
      expect(mockDataSources.stackBlitzAPI.getProjects).toHaveBeenCalledWith(
        { tag: 'react' },
        { first: 10 }
      );
      expect(result).toEqual(mockProjects);
    });
  });

  describe('Mutation resolvers', () => {
    it('should resolve createProject mutation', async () => {
      const mockInput = {
        title: 'New Project',
        files: { 'index.js': 'console.log("test")' },
        template: 'javascript'
      };
      
      const mockResult = {
        project: { id: 'new-proj', title: 'New Project' }
      };
      
      mockDataSources.stackBlitzAPI.createProject.mockResolvedValue(mockResult);
      
      const result = await resolvers.Mutation?.createProject?.(
        {},
        { input: mockInput },
        mockContext,
        {} as any
      );
      
      expect(mockDataSources.stackBlitzAPI.createProject).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockResult);
    });

    it('should resolve updateProject mutation', async () => {
      const mockInput = { title: 'Updated Title' };
      const mockResult = {
        project: { id: 'proj1', title: 'Updated Title' }
      };
      
      mockDataSources.stackBlitzAPI.updateProject.mockResolvedValue(mockResult);
      
      const result = await resolvers.Mutation?.updateProject?.(
        {},
        { id: 'proj1', input: mockInput },
        mockContext,
        {} as any
      );
      
      expect(mockDataSources.stackBlitzAPI.updateProject).toHaveBeenCalledWith('proj1', mockInput);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Type resolvers', () => {
    it('should resolve User.projects field', async () => {
      const mockUser = { id: 'VXNlcjpteS11c2Vy' };
      const mockProjects = {
        edges: [{ cursor: '1', node: { id: 'proj1' } }],
        pageInfo: { hasNextPage: false }
      };
      
      mockDataSources.stackBlitzAPI.getUserProjects.mockResolvedValue(mockProjects);
      
      const result = await resolvers.User?.projects?.(
        mockUser,
        { filters: { tag: 'react' }, pagination: { first: 5 } },
        mockContext,
        {} as any
      );
      
      expect(mockDataSources.stackBlitzAPI.getUserProjects).toHaveBeenCalledWith(
        'my-user',
        { tag: 'react' },
        { first: 5 }
      );
      expect(result).toEqual(mockProjects);
    });

    it('should resolve __resolveType for Node interface', () => {
      const projectNode = { title: 'My Project', files: {} };
      const userNode = { username: 'testuser' };
      
      const projectType = resolvers.Node?.__resolveType(projectNode, {} as any, {} as any);
      const userType = resolvers.Node?.__resolveType(userNode, {} as any, {} as any);
      
      expect(projectType).toBe('Project');
      expect(userType).toBe('User');
    });
  });
});