import { IResolvers } from '@graphql-tools/utils';
import { StackBlitzDataSource } from './datasource';
import { 
  ResolverContext, 
  Resolvers, 
  StackBlitzProject, 
  StackBlitzUser,
  Node
} from './types';

// Decode a global ID into type and local ID
function decodeGlobalId(globalId: string): { type: string; id: string } {
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

const resolvers: Resolvers = {
  Query: {
    node: async (_, { id }, { dataSources }) => {
      return dataSources.stackBlitzAPI.getNodeById(id);
    },
    
    projects: async (_, { filters, pagination }, { dataSources }) => {
      return dataSources.stackBlitzAPI.getProjects(filters, pagination);
    },
    
    project: async (_, { id }, { dataSources }) => {
      return dataSources.stackBlitzAPI.getProjectById(id);
    },
    
    users: async (_, { pagination }, { dataSources }) => {
      return dataSources.stackBlitzAPI.getUsers(pagination);
    },
    
    user: async (_, { id }, { dataSources }) => {
      return dataSources.stackBlitzAPI.getUserById(id);
    },
  },
  
  Mutation: {
    createProject: async (_, { input }, { dataSources }) => {
      return dataSources.stackBlitzAPI.createProject(input);
    },
    
    updateProject: async (_, { id, input }, { dataSources }) => {
      return dataSources.stackBlitzAPI.updateProject(id, input);
    },
    
    deleteProject: async (_, { id }, { dataSources }) => {
      return dataSources.stackBlitzAPI.deleteProject(id);
    },
    
    forkProject: async (_, { id, input }, { dataSources }) => {
      return dataSources.stackBlitzAPI.forkProject(id, input);
    },
  },
  
  Project: {
    // Resolve fields with custom logic if needed
    owner: async (project, _, { dataSources }) => {
      // If the owner is already included in the project data, use it
      if (project.owner) return project.owner;
      
      // Otherwise, fetch the owner using the project's owner ID
      // This assumes there's an ownerId field in the project data
      if (project.ownerId) {
        return dataSources.stackBlitzAPI.getUserById(project.ownerId);
      }
      
      throw new Error(`Cannot resolve owner for project ${project.id}`);
    },
  },
  
  User: {
    // Resolve user's projects with pagination and filters
    projects: async (user, { filters, pagination }, { dataSources }) => {
      const { id } = decodeGlobalId(user.id);
      return dataSources.stackBlitzAPI.getUserProjects(id, filters, pagination);
    },
  },

  Node: {
    __resolveType(obj) {
      // Determine the type of a Node based on its structure
      if ('title' in obj && 'files' in obj) return 'Project';
      if ('username' in obj) return 'User';
      return null;
    },
  },
};

export const Query = resolvers.Query;
export const Mutation = resolvers.Mutation;
export const Project = resolvers.Project;
export const User = resolvers.User;
export const Node = resolvers.Node;

export default resolvers;