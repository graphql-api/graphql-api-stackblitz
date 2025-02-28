# @graphql-api/stackblitz

[![npm version](https://img.shields.io/npm/v/@graphql-api/stackblitz.svg)](https://www.npmjs.com/package/@graphql-api/stackblitz)
[![Build Status](https://github.com/graphql-api/graphql-api-template/actions/workflows/publish.yml/badge.svg)](https://github.com/graphql-api/graphql-api-template/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

A comprehensive GraphQL API library for StackBlitz integration, providing a complete wrapper around the StackBlitz SDK with Apollo DataSource compatibility.

## Features

- 🚀 Complete wrapper around @stackblitz/sdk
- 🔗 Apollo DataSource implementation for GraphQL resolvers
- 📚 Comprehensive TypeScript typings
- 🔄 Connection-based pagination with cursor support
- 🧩 Relay-compatible Node interface for global object identification
- 🛠️ Configurable API client with authentication support
- 📝 Well-documented API methods

## Installation

```bash
npm install @graphql-api/stackblitz
# or
yarn add @graphql-api/stackblitz
# or
pnpm add @graphql-api/stackblitz
```

## Quick Start

### Setting up the Data Source

```typescript
import { ApolloServer } from '@apollo/server';
import { StackBlitzDataSource } from '@graphql-api/stackblitz';
import { resolvers, typeDefs } from './schema';

// Create new Apollo Server with StackBlitz datasource
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Provide DataSources in context
const { url } = await startStandaloneServer(server, {
  context: async () => {
    return {
      dataSources: {
        stackBlitzAPI: new StackBlitzDataSource({
          apiKey: process.env.STACKBLITZ_API_KEY,
          // Optional configuration
          apiUrl: 'https://api.stackblitz.com',
          timeout: 30000,
          headers: {
            'X-Custom-Header': 'value'
          }
        })
      }
    };
  }
});

console.log(`🚀 Server ready at ${url}`);
```

### Using the DataSource in Resolvers

```typescript
const resolvers = {
  Query: {
    project: (_, { id }, { dataSources }) => {
      return dataSources.stackBlitzAPI.getProjectById(id);
    },
    projects: (_, { filters, pagination }, { dataSources }) => {
      return dataSources.stackBlitzAPI.getProjects(filters, pagination);
    }
  },
  Mutation: {
    createProject: (_, { input }, { dataSources }) => {
      return dataSources.stackBlitzAPI.createProject(input);
    }
  }
};
```

### Client-Side SDK Usage

The library also provides direct access to StackBlitz SDK client methods:

```typescript
import { StackBlitzDataSource } from '@graphql-api/stackblitz';

const stackblitz = new StackBlitzDataSource();

// Embed a StackBlitz project in an element
stackblitz.embedProject('elementId', {
  title: 'My New Project',
  description: 'A simple demo project',
  files: {
    'index.js': 'console.log("Hello, StackBlitz!");',
    'index.html': '<div id="app"></div>'
  },
  template: 'javascript'
});

// Open a project in a new tab
stackblitz.openProject({
  title: 'My Project',
  files: {
    'index.js': 'console.log("Hello!");',
  },
  template: 'javascript'
});
```

## API Reference

### Data Sources

#### `StackBlitzDataSource`

Main data source class that implements both REST API calls and client-side SDK functionality.

```typescript
constructor(config?: StackBlitzConfig)
```

Configuration options:
- `apiUrl`: Base URL for the StackBlitz API (default: 'https://api.stackblitz.com')
- `apiKey`: Your StackBlitz API key for authentication
- `timeout`: Request timeout in milliseconds (default: 30000)
- `headers`: Additional HTTP headers to include in requests

### Server-Side API Methods

#### Projects
- `getProjects(filters?: ProjectFilters, pagination?: PaginationInput)`: Fetch projects with optional filtering and pagination
- `getProjectById(id: string)`: Fetch a single project by ID
- `createProject(input: CreateProjectInput)`: Create a new project
- `updateProject(id: string, input: UpdateProjectInput)`: Update an existing project
- `deleteProject(id: string)`: Delete a project
- `forkProject(id: string, input?: UpdateProjectInput)`: Fork a project with optional modifications

#### Users
- `getUsers(pagination?: PaginationInput)`: Fetch users with pagination
- `getUserById(id: string)`: Fetch a single user by ID
- `getUserProjects(userId: string, filters?: ProjectFilters, pagination?: PaginationInput)`: Fetch projects for a specific user

#### Nodes
- `getNodeById(globalId: string)`: Fetch an object by its global ID (for Relay compatibility)

### Client-Side SDK Methods

- `embedProject(elementOrId, project, options?)`: Create and embed a project in an element
- `openProject(project, options?)`: Open a project in a new tab
- `embedGithubProject(elementOrId, githubProject, options?)`: Embed a project from GitHub
- `openGithubProject(githubProject, options?)`: Open a GitHub project in a new tab

## GraphQL Schema

The library provides a complete GraphQL schema with queries, mutations, and types for working with StackBlitz:

```graphql
# Main entry points
type Query {
  node(id: ID!): Node
  projects(filters: ProjectFiltersInput, pagination: PaginationInput): ProjectConnection!
  project(id: ID!): Project
  users(pagination: PaginationInput): UserConnection!
  user(id: ID!): User
}

type Mutation {
  createProject(input: CreateProjectInput!): CreateProjectPayload!
  updateProject(id: ID!, input: UpdateProjectInput!): UpdateProjectPayload!
  deleteProject(id: ID!): DeleteProjectPayload!
  forkProject(id: ID!, input: UpdateProjectInput): ForkProjectPayload!
}
```

See the full schema in the [documentation](https://github.com/graphql-api/graphql-api-template/blob/main/src/typeDefs.graphql).

## Examples

### Creating a Project

```typescript
const { project } = await dataSources.stackBlitzAPI.createProject({
  title: 'My React App',
  description: 'A simple React application',
  files: {
    'index.js': 'import React from "react"; import ReactDOM from "react-dom";',
    'App.js': 'export default () => <h1>Hello StackBlitz!</h1>;',
    'index.html': '<div id="root"></div>'
  },
  template: 'react',
  dependencies: {
    'react': '17.0.2',
    'react-dom': '17.0.2'
  }
});
```

### Pagination with Filters

```typescript
const { edges, pageInfo } = await dataSources.stackBlitzAPI.getProjects(
  // Filters
  {
    tag: 'react',
    search: 'todo app'
  },
  // Pagination
  {
    first: 10,
    after: 'cursor-value'
  }
);

// Access results
edges.forEach(({ node }) => console.log(node.title));

// Check if there are more results
if (pageInfo.hasNextPage) {
  // Fetch next page using the endCursor
  const nextPage = await dataSources.stackBlitzAPI.getProjects(
    { tag: 'react', search: 'todo app' },
    { first: 10, after: pageInfo.endCursor }
  );
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.