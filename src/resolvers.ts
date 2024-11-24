import { IResolvers } from 'graphql-tools';
import { DataSources } from './dataSources'; // Adjust the import based on your project structure

const resolvers: IResolvers = {
  Query: {
    node: async (_, { id }, { dataSources }: { dataSources: DataSources }) => {
      const { type, idValue } = decodeGlobalId(id);
      switch (type) {
        case 'Project':
          return dataSources.stackBlitzAPI.getProjectById(idValue);
        case 'User':
          return dataSources.stackBlitzAPI.getUserById(idValue);
        default:
          throw new Error(`No such type for id ${id}`);
      }
    },
    
    projects: async (_, { first, after }, { dataSources }: { dataSources: DataSources }) => {
      return dataSources.stackBlitzAPI.getProjects(first, after);
    },
    
    project: async (_, { id }, { dataSources }: { dataSources: DataSources }) => {
      return dataSources.stackBlitzAPI.getProjectById(id);
    },
    
    users: async (_, { first, after }, { dataSources }: { dataSources: DataSources }) => {
      return dataSources.stackBlitzAPI.getUsers(first, after);
    },
    
    user: async (_, { id }, { dataSources }: { dataSources: DataSources }) => {
      return dataSources.stackBlitzAPI.getUserById(id);
    },
  },
  

  Mutation: {
    createProject: async (_, { input }, { dataSources }: { dataSources: DataSources }) => {
      return dataSources.stackBlitzAPI.createProject(input);
    },
    
    updateProject: async (_, { id, input }, { dataSources }: { dataSources: DataSources }) => {
      return dataSources.stackBlitzAPI.updateProject(id, input);
    },
    
    deleteProject: async (_, { id }, { dataSources }: { dataSources: DataSources }) => {
      return dataSources.stackBlitzAPI.deleteProject(id);
    },
  },

  Node: {
     // Resolve the global ID for both Project and User types.
     __resolveType(obj) {
       if (obj.title) return 'Project';
       if (obj.username) return 'User';
       return null; // GraphQLError is thrown for invalid types.
     },
   },
};

function decodeGlobalId(globalId) {
   const decoded = Buffer.from(globalId, 'base64').toString('utf-8');
   const [type, idValue] = decoded.split(':');
   return { type, idValue };
}

export const Query = resolvers.Query
export const Mutation = resolvers.Mutation
export const Node = resolvers.Node
