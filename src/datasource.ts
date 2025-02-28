import { RESTDataSource, RequestOptions } from '@apollo/datasource-rest';
import * as sdk from '@stackblitz/sdk';
import { 
  StackBlitzConfig, 
  StackBlitzProject, 
  StackBlitzUser, 
  CreateProjectInput, 
  UpdateProjectInput, 
  ProjectFilters,
  ProjectConnection,
  UserConnection,
  PageInfo,
} from './types';

/**
 * StackBlitzDataSource - A comprehensive wrapper around StackBlitz SDK that implements
 * Apollo's DataSource interface for efficient integration with GraphQL resolvers.
 */
export class StackBlitzDataSource extends RESTDataSource {
  private config: StackBlitzConfig;
  private sdkInstance: typeof sdk;

  /**
   * Creates a new StackBlitzDataSource instance
   * @param config Configuration options for the StackBlitz API
   */
  constructor(config: StackBlitzConfig = {}) {
    super();
    this.config = {
      apiUrl: 'https://api.stackblitz.com',
      timeout: 30000,
      ...config
    };
    this.baseURL = this.config.apiUrl;
    this.sdkInstance = sdk;
  }

  /**
   * Intercept requests to add authentication headers and other configuration
   */
  override willSendRequest(request: RequestOptions) {
    // Add API key if available
    if (this.config.apiKey) {
      request.headers.set('Authorization', `Bearer ${this.config.apiKey}`);
    }

    // Add custom headers if provided
    if (this.config.headers) {
      Object.entries(this.config.headers).forEach(([key, value]) => {
        request.headers.set(key, value);
      });
    }

    // Set timeout
    request.timeout = this.config.timeout;
  }

  /**
   * Error handling helper
   */
  private handleError(error: any, operation: string): never {
    const errorMsg = error.message || 'Unknown error';
    console.error(`StackBlitz ${operation} operation failed: ${errorMsg}`, error);
    
    // Enhance the error with additional context
    const enhancedError = new Error(`StackBlitz ${operation} failed: ${errorMsg}`);
    enhancedError.name = 'StackBlitzAPIError';
    enhancedError.cause = error;
    
    throw enhancedError;
  }

  /**
   * Create a globally unique ID by combining the type and ID
   */
  private createGlobalId(type: string, id: string): string {
    return Buffer.from(`${type}:${id}`).toString('base64');
  }

  /**
   * Decode a globally unique ID back to its type and local ID
   */
  private decodeGlobalId(globalId: string): { type: string; id: string } {
    try {
      const decoded = Buffer.from(globalId, 'base64').toString('utf-8');
      const [type, id] = decoded.split(':');
      if (!type || !id) {
        throw new Error('Invalid ID format');
      }
      return { type, id };
    } catch (error) {
      throw new Error(`Invalid global ID: ${globalId}`);
    }
  }

  /**
   * Get entity by global ID
   */
  async getNodeById(globalId: string): Promise<StackBlitzProject | StackBlitzUser | null> {
    try {
      const { type, id } = this.decodeGlobalId(globalId);
      
      switch (type) {
        case 'Project':
          return this.getProjectById(id);
        case 'User':
          return this.getUserById(id);
        default:
          return null;
      }
    } catch (error) {
      this.handleError(error, 'getNodeById');
    }
  }

  /**
   * Fetch projects with optional filters and pagination
   */
  async getProjects(
    filters?: ProjectFilters,
    pagination?: { first?: number; after?: string }
  ): Promise<ProjectConnection> {
    try {
      const params: Record<string, string | number | undefined> = {
        limit: pagination?.first,
        cursor: pagination?.after,
        ...filters
      };

      const response = await this.get('/projects', params);
      return this.transformProjectsResponse(response);
    } catch (error) {
      this.handleError(error, 'getProjects');
    }
  }

  /**
   * Fetch a single project by ID
   */
  async getProjectById(id: string): Promise<StackBlitzProject> {
    try {
      const response = await this.get(`/projects/${id}`);
      return this.transformProjectResponse(response);
    } catch (error) {
      this.handleError(error, 'getProjectById');
    }
  }

  /**
   * Fetch projects for a specific user
   */
  async getUserProjects(
    userId: string,
    filters?: ProjectFilters,
    pagination?: { first?: number; after?: string }
  ): Promise<ProjectConnection> {
    try {
      const params: Record<string, string | number | undefined> = {
        limit: pagination?.first,
        cursor: pagination?.after,
        ...filters
      };

      const response = await this.get(`/users/${userId}/projects`, params);
      return this.transformProjectsResponse(response);
    } catch (error) {
      this.handleError(error, 'getUserProjects');
    }
  }

  /**
   * Fetch users with optional pagination
   */
  async getUsers(
    pagination?: { first?: number; after?: string }
  ): Promise<UserConnection> {
    try {
      const params: Record<string, string | number | undefined> = {
        limit: pagination?.first,
        cursor: pagination?.after,
      };

      const response = await this.get('/users', params);
      return this.transformUsersResponse(response);
    } catch (error) {
      this.handleError(error, 'getUsers');
    }
  }

  /**
   * Fetch a single user by ID
   */
  async getUserById(id: string): Promise<StackBlitzUser> {
    try {
      const response = await this.get(`/users/${id}`);
      return this.transformUserResponse(response);
    } catch (error) {
      this.handleError(error, 'getUserById');
    }
  }

  /**
   * Create a new project
   */
  async createProject(input: CreateProjectInput): Promise<{ project: StackBlitzProject }> {
    try {
      // Validate required fields
      if (!input.title || !input.files || !input.template) {
        throw new Error('Project requires title, files, and template');
      }

      const response = await this.post('/projects', input);
      return { 
        project: this.transformProjectResponse(response) 
      };
    } catch (error) {
      this.handleError(error, 'createProject');
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(
    id: string, 
    input: UpdateProjectInput
  ): Promise<{ project: StackBlitzProject }> {
    try {
      // Validate there's something to update
      if (Object.keys(input).length === 0) {
        throw new Error('No update parameters provided');
      }

      const response = await this.patch(`/projects/${id}`, input);
      return { 
        project: this.transformProjectResponse(response) 
      };
    } catch (error) {
      this.handleError(error, 'updateProject');
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<{ success: boolean }> {
    try {
      await this.delete(`/projects/${id}`);
      return { success: true };
    } catch (error) {
      this.handleError(error, 'deleteProject');
    }
  }

  /**
   * Fork a project
   */
  async forkProject(
    id: string, 
    input?: UpdateProjectInput
  ): Promise<{ project: StackBlitzProject }> {
    try {
      const response = await this.post(`/projects/${id}/fork`, input || {});
      return { 
        project: this.transformProjectResponse(response) 
      };
    } catch (error) {
      this.handleError(error, 'forkProject');
    }
  }

  /**
   * SDK-specific methods for client-side functionality
   */

  /**
   * Create and embed a project in a DOM element
   */
  embedProject(
    elementOrId: string | HTMLElement,
    project: Partial<StackBlitzProject>,
    options?: sdk.EmbedOptions
  ): Promise<sdk.VM> {
    try {
      return this.sdkInstance.embedProject(
        elementOrId, 
        {
          title: project.title || 'StackBlitz Project',
          description: project.description,
          files: project.files || {},
          template: project.template || 'javascript',
          dependencies: project.dependencies,
          settings: project.settings,
          tags: project.tags,
        }, 
        options
      );
    } catch (error) {
      this.handleError(error, 'embedProject');
    }
  }

  /**
   * Open a project in a new tab
   */
  openProject(
    project: Partial<StackBlitzProject>,
    options?: sdk.OpenOptions
  ): sdk.VM {
    try {
      return this.sdkInstance.openProject(
        {
          title: project.title || 'StackBlitz Project',
          description: project.description,
          files: project.files || {},
          template: project.template || 'javascript',
          dependencies: project.dependencies,
          settings: project.settings,
          tags: project.tags,
        }, 
        options
      );
    } catch (error) {
      this.handleError(error, 'openProject');
    }
  }

  /**
   * Get project from GitHub repo and embed it
   */
  embedGithubProject(
    elementOrId: string | HTMLElement,
    githubProject: string,
    options?: sdk.EmbedOptions
  ): Promise<sdk.VM> {
    try {
      return this.sdkInstance.embedGithubProject(elementOrId, githubProject, options);
    } catch (error) {
      this.handleError(error, 'embedGithubProject');
    }
  }

  /**
   * Open GitHub project in a new tab
   */
  openGithubProject(
    githubProject: string,
    options?: sdk.OpenOptions
  ): sdk.VM {
    try {
      return this.sdkInstance.openGithubProject(githubProject, options);
    } catch (error) {
      this.handleError(error, 'openGithubProject');
    }
  }

  /**
   * Data transformation helpers
   */

  private transformProjectsResponse(response: any): ProjectConnection {
    if (!response?.items || !Array.isArray(response.items)) {
      throw new Error('Invalid response format for projects');
    }

    return {
      edges: response.items.map((project: any) => ({
        cursor: project.id || '',
        node: this.transformProjectResponse(project),
      })),
      pageInfo: this.transformPageInfo(response),
    };
  }

  private transformProjectResponse(project: any): StackBlitzProject {
    if (!project || !project.id) {
      throw new Error('Invalid project data');
    }

    return {
      id: this.createGlobalId('Project', project.id),
      title: project.title || '',
      description: project.description || null,
      files: project.files || {},
      template: project.template || 'javascript',
      dependencies: project.dependencies || null,
      settings: project.settings || null,
      tags: project.tags || null,
      createdAt: project.createdAt || null,
      updatedAt: project.updatedAt || null,
      openFile: project.openFile || null,
    };
  }

  private transformUsersResponse(response: any): UserConnection {
    if (!response?.items || !Array.isArray(response.items)) {
      throw new Error('Invalid response format for users');
    }

    return {
      edges: response.items.map((user: any) => ({
        cursor: user.id || '',
        node: this.transformUserResponse(user),
      })),
      pageInfo: this.transformPageInfo(response),
    };
  }

  private transformUserResponse(user: any): StackBlitzUser {
    if (!user || !user.id) {
      throw new Error('Invalid user data');
    }

    return {
      id: this.createGlobalId('User', user.id),
      username: user.username || '',
      displayName: user.displayName || null,
      url: user.url || null,
      avatarUrl: user.avatarUrl || null,
    };
  }

  private transformPageInfo(response: any): PageInfo {
    return {
      hasNextPage: Boolean(response.hasNextPage),
      endCursor: response.endCursor || null,
    };
  }
}

export default StackBlitzDataSource;