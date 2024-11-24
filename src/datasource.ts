import { RESTDataSource } from '@apollo/datasource-rest';

class StackBlitzAPI extends RESTDataSource {
  constructor() {
    super();
    // Set the base URL for the StackBlitz API
    this.baseURL = 'https://api.stackblitz.com'; // Adjust as necessary
  }

  // Fetch all projects with optional pagination
  async getProjects(first?: number, after?: string) {
    const response = await this.get('/projects', {
      first,
      after,
    });
    return this.transformProjects(response);
  }

  // Fetch a single project by ID
  async getProjectById(id: string) {
    const response = await this.get(`/projects/${id}`);
    return this.transformProject(response);
  }

  // Fetch all users with optional pagination
  async getUsers(first?: number, after?: string) {
    const response = await this.get('/users', {
      first,
      after,
    });
    return this.transformUsers(response);
  }

  // Fetch a single user by ID
  async getUserById(id: string) {
    const response = await this.get(`/users/${id}`);
    return this.transformUser(response);
  }

  // Create a new project
  async createProject(input: { title: string; description?: string }) {
    const response = await this.post('/projects', input);
    return { project: this.transformProject(response) };
  }

  // Update an existing project
  async updateProject(id: string, input: { title?: string; description?: string }) {
    const response = await this.put(`/projects/${id}`, input);
    return { project: this.transformProject(response) };
  }

  // Delete a project by ID
  async deleteProject(id: string) {
    await this.delete(`/projects/${id}`);
    return { success: true };
  }

  // Transformations to match GraphQL schema types

  private transformProjects(response: any) {
    return {
      edges: response.items.map((project: any) => ({
        cursor: project.id,
        node: this.transformProject(project),
      })),
      pageInfo: {
        hasNextPage: response.hasNextPage,
        endCursor: response.endCursor,
      },
    };
  }

  private transformProject(project: any) {
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      owner: project.owner, // Assuming owner is already a User object
    };
  }

  private transformUsers(response: any) {
    return {
      edges: response.items.map((user: any) => ({
        cursor: user.id,
        node: this.transformUser(user),
      })),
      pageInfo: {
        hasNextPage: response.hasNextPage,
        endCursor: response.endCursor,
      },
    };
  }

  private transformUser(user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      projects: user.projects, // Assuming projects is already structured correctly
    };
  }
}

export default StackBlitzAPI;
