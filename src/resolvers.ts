import { IResolvers } from 'graphql-tools';
import { DataSources } from './dataSources'; // Adjust the import based on your project structure

export const resolvers: IResolvers = {
  Query: {
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
}
