/* eslint-disable */
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { NodeClusterTypeWrapper as NodeClusterTypeWrapperModel, Cluster as ClusterModel } from 'model';
import type { Context } from 'context';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  URL: string;
};

export type Cluster = Node & {
  readonly id: Scalars['ID'];
  readonly load: Scalars['Float'];
  readonly location: Location;
};

export type Country = Node & {
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly code: Scalars['String'];
  readonly flagURL: Scalars['URL'];
  readonly clusters: ReadonlyArray<Cluster>;
};

export type Location = {
  readonly name: Scalars['String'];
  readonly country: Country;
};

export type Mutation = {
  readonly connect: Cluster;
  readonly disconnect: Maybe<Cluster>;
};


export type MutationConnectArgs = {
  id: Scalars['ID'];
};

export type Node = {
  readonly id: Scalars['ID'];
};

export type Query = {
  readonly node: Maybe<Node>;
  readonly current: Maybe<Cluster>;
  readonly countries: ReadonlyArray<Country>;
  readonly clusters: ReadonlyArray<Cluster>;
  readonly search: ReadonlyArray<Node>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};


export type QuerySearchArgs = {
  query: Scalars['String'];
  kinds?: ReadonlyArray<SearchableKind>;
};

export enum SearchableKind {
  Cluster = 'CLUSTER',
  Country = 'COUNTRY'
}


export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Cluster: ResolverTypeWrapper<NodeClusterTypeWrapperModel>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Country: ResolverTypeWrapper<NodeClusterTypeWrapperModel>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Location: ResolverTypeWrapper<ClusterModel>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['Cluster'] | ResolversTypes['Country'];
  Query: ResolverTypeWrapper<{}>;
  SearchableKind: SearchableKind;
  URL: ResolverTypeWrapper<Scalars['URL']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Cluster: NodeClusterTypeWrapperModel;
  ID: Scalars['ID'];
  Float: Scalars['Float'];
  Country: NodeClusterTypeWrapperModel;
  String: Scalars['String'];
  Location: ClusterModel;
  Mutation: {};
  Node: ResolversParentTypes['Cluster'] | ResolversParentTypes['Country'];
  Query: {};
  URL: Scalars['URL'];
  Boolean: Scalars['Boolean'];
}>;

export type ClusterResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Cluster'] = ResolversParentTypes['Cluster']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  load: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  location: Resolver<ResolversTypes['Location'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CountryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Country'] = ResolversParentTypes['Country']> = ResolversObject<{
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  code: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  flagURL: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  clusters: Resolver<ReadonlyArray<ResolversTypes['Cluster']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LocationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = ResolversObject<{
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  country: Resolver<ResolversTypes['Country'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  connect: Resolver<ResolversTypes['Cluster'], ParentType, ContextType, RequireFields<MutationConnectArgs, 'id'>>;
  disconnect: Resolver<Maybe<ResolversTypes['Cluster']>, ParentType, ContextType>;
}>;

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Cluster' | 'Country', ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  node: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  current: Resolver<Maybe<ResolversTypes['Cluster']>, ParentType, ContextType>;
  countries: Resolver<ReadonlyArray<ResolversTypes['Country']>, ParentType, ContextType>;
  clusters: Resolver<ReadonlyArray<ResolversTypes['Cluster']>, ParentType, ContextType>;
  search: Resolver<ReadonlyArray<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QuerySearchArgs, 'query' | 'kinds'>>;
}>;

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type Resolvers<ContextType = Context> = ResolversObject<{
  Cluster: ClusterResolvers<ContextType>;
  Country: CountryResolvers<ContextType>;
  Location: LocationResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  Node: NodeResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  URL: GraphQLScalarType;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
