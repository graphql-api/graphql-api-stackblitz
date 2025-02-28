import { StackBlitzDataSource } from '../src/datasource';

describe('StackBlitzDataSource', () => {
  let dataSource: StackBlitzDataSource;

  beforeEach(() => {
    dataSource = new StackBlitzDataSource();
    // Mock the internal RESTDataSource methods
    dataSource.get = jest.fn();
    dataSource.post = jest.fn();
    dataSource.patch = jest.fn();
    dataSource.delete = jest.fn();
  });

  describe('getProjects', () => {
    it('should fetch projects with pagination', async () => {
      // Mock response data
      const mockResponse = {
        items: [
          { id: 'project1', title: 'Project 1' },
          { id: 'project2', title: 'Project 2' }
        ],
        hasNextPage: true,
        endCursor: 'cursor123'
      };
      
      (dataSource.get as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await dataSource.getProjects(
        { search: 'test' },
        { first: 10, after: 'cursor' }
      );
      
      expect(dataSource.get).toHaveBeenCalledWith('/projects', {
        limit: 10,
        cursor: 'cursor',
        search: 'test'
      });
      
      expect(result.edges.length).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.pageInfo.endCursor).toBe('cursor123');
    });
  });

  describe('getProjectById', () => {
    it('should fetch a project by ID', async () => {
      const mockProject = {
        id: 'project1',
        title: 'Project 1',
        description: 'Test project',
        files: { 'index.js': 'console.log("test")' },
        template: 'javascript'
      };
      
      (dataSource.get as jest.Mock).mockResolvedValue(mockProject);
      
      const result = await dataSource.getProjectById('project1');
      
      expect(dataSource.get).toHaveBeenCalledWith('/projects/project1');
      expect(result.title).toBe('Project 1');
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const mockInput = {
        title: 'New Project',
        description: 'A test project',
        files: { 'index.js': 'console.log("hello")' },
        template: 'javascript'
      };
      
      const mockResponse = {
        id: 'new-project',
        ...mockInput
      };
      
      (dataSource.post as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await dataSource.createProject(mockInput);
      
      expect(dataSource.post).toHaveBeenCalledWith('/projects', mockInput);
      expect(result.project.title).toBe('New Project');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project and return success', async () => {
      (dataSource.delete as jest.Mock).mockResolvedValue({});
      
      const result = await dataSource.deleteProject('project-id');
      
      expect(dataSource.delete).toHaveBeenCalledWith('/projects/project-id');
      expect(result.success).toBe(true);
    });
  });
});