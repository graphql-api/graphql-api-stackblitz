import { GraphQLResolveInfo } from 'graphql';

export interface DataSources {
  stackBlitzAPI: StackBlitzDataSource;
}

export interface StackBlitzConfig {
  apiUrl?: string;
  apiKey?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface StackBlitzProject {
  id: string;
  title: string;
  description?: string;
  files: Record<string, string>;
  template: string;
  dependencies?: Record<string, string>;
  settings?: StackBlitzProjectSettings;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  openFile?: string;
}

export interface StackBlitzProjectSettings {
  compile?: {
    clearConsole?: boolean;
    hardReloadOnChange?: boolean;
    ignoreWarnings?: boolean;
  };
  devToolsHeight?: number;
  hideDevTools?: boolean;
  hideNavigation?: boolean;
}

export interface StackBlitzUser {
  id: string;
  username: string;
  displayName?: string;
  url?: string;
  avatarUrl?: string;
  projects?: StackBlitzProject[];
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  files: Record<string, string>;
  template: string;
  dependencies?: Record<string, string>;
  settings?: StackBlitzProjectSettings;
  tags?: string[];
  openFile?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  files?: Record<string, string>;
  dependencies?: Record<string, string>;
  settings?: StackBlitzProjectSettings;
  tags?: string[];
  openFile?: string;
}

export interface ProjectFilters {
  userId?: string;
  tag?: string;
  search?: string;
  template?: string;
}

export interface PaginationInput {
  first?: number;
  after?: string;
}

export type StackBlitzDataSource = any;

export interface ResolverContext {
  dataSources: DataSources;
}

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export interface Resolvers<ContextType = ResolverContext> {
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
}

export interface QueryResolvers<ContextType = ResolverContext> {
  node?: ResolverFn<
    Node | null,
    {},
    ContextType,
    { id: string }
  >;
  projects?: ResolverFn<
    ProjectConnection,
    {},
    ContextType,
    { filters?: ProjectFilters | null; pagination?: PaginationInput | null }
  >;
  project?: ResolverFn<
    StackBlitzProject | null,
    {},
    ContextType,
    { id: string }
  >;
  users?: ResolverFn<
    UserConnection,
    {},
    ContextType,
    { pagination?: PaginationInput | null }
  >;
  user?: ResolverFn<
    StackBlitzUser | null,
    {},
    ContextType,
    { id: string }
  >;
}

export interface MutationResolvers<ContextType = ResolverContext> {
  createProject?: ResolverFn<
    { project: StackBlitzProject },
    {},
    ContextType,
    { input: CreateProjectInput }
  >;
  updateProject?: ResolverFn<
    { project: StackBlitzProject },
    {},
    ContextType,
    { id: string; input: UpdateProjectInput }
  >;
  deleteProject?: ResolverFn<
    { success: boolean },
    {},
    ContextType,
    { id: string }
  >;
  forkProject?: ResolverFn<
    { project: StackBlitzProject },
    {},
    ContextType,
    { id: string; input?: UpdateProjectInput | null }
  >;
}

export interface ProjectResolvers<ContextType = ResolverContext> {
  id?: ResolverFn<string, StackBlitzProject, ContextType, {}>;
  title?: ResolverFn<string, StackBlitzProject, ContextType, {}>;
  description?: ResolverFn<string | null, StackBlitzProject, ContextType, {}>;
  files?: ResolverFn<Record<string, string>, StackBlitzProject, ContextType, {}>;
  template?: ResolverFn<string, StackBlitzProject, ContextType, {}>;
  dependencies?: ResolverFn<Record<string, string> | null, StackBlitzProject, ContextType, {}>;
  settings?: ResolverFn<StackBlitzProjectSettings | null, StackBlitzProject, ContextType, {}>;
  tags?: ResolverFn<string[] | null, StackBlitzProject, ContextType, {}>;
  createdAt?: ResolverFn<string | null, StackBlitzProject, ContextType, {}>;
  updatedAt?: ResolverFn<string | null, StackBlitzProject, ContextType, {}>;
  openFile?: ResolverFn<string | null, StackBlitzProject, ContextType, {}>;
  owner?: ResolverFn<StackBlitzUser, StackBlitzProject, ContextType, {}>;
}

export interface UserResolvers<ContextType = ResolverContext> {
  id?: ResolverFn<string, StackBlitzUser, ContextType, {}>;
  username?: ResolverFn<string, StackBlitzUser, ContextType, {}>;
  displayName?: ResolverFn<string | null, StackBlitzUser, ContextType, {}>;
  url?: ResolverFn<string | null, StackBlitzUser, ContextType, {}>;
  avatarUrl?: ResolverFn<string | null, StackBlitzUser, ContextType, {}>;
  projects?: ResolverFn<
    ProjectConnection,
    StackBlitzUser,
    ContextType,
    { filters?: ProjectFilters | null; pagination?: PaginationInput | null }
  >;
}

export interface NodeResolvers<ContextType = ResolverContext> {
  __resolveType: (obj: Node, context: ContextType, info: GraphQLResolveInfo) => 'Project' | 'User' | null;
  id?: ResolverFn<string, Node, ContextType, {}>;
}

export interface Node {
  id: string;
}

export interface ProjectConnection {
  edges: ProjectEdge[];
  pageInfo: PageInfo;
}

export interface ProjectEdge {
  cursor: string;
  node: StackBlitzProject;
}

export interface UserConnection {
  edges: UserEdge[];
  pageInfo: PageInfo;
}

export interface UserEdge {
  cursor: string;
  node: StackBlitzUser;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}