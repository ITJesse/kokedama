import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  jsonb: any;
  timestamp: any;
  timestamptz: string;
  uuid: any;
};


/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: Maybe<Scalars['Boolean']>;
  _gt?: Maybe<Scalars['Boolean']>;
  _gte?: Maybe<Scalars['Boolean']>;
  _in?: Maybe<Array<Scalars['Boolean']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['Boolean']>;
  _lte?: Maybe<Scalars['Boolean']>;
  _neq?: Maybe<Scalars['Boolean']>;
  _nin?: Maybe<Array<Scalars['Boolean']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: Maybe<Scalars['Int']>;
  _gt?: Maybe<Scalars['Int']>;
  _gte?: Maybe<Scalars['Int']>;
  _in?: Maybe<Array<Scalars['Int']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['Int']>;
  _lte?: Maybe<Scalars['Int']>;
  _neq?: Maybe<Scalars['Int']>;
  _nin?: Maybe<Array<Scalars['Int']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: Maybe<Scalars['String']>;
  _gt?: Maybe<Scalars['String']>;
  _gte?: Maybe<Scalars['String']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: Maybe<Scalars['String']>;
  _in?: Maybe<Array<Scalars['String']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: Maybe<Scalars['String']>;
  _is_null?: Maybe<Scalars['Boolean']>;
  /** does the column match the given pattern */
  _like?: Maybe<Scalars['String']>;
  _lt?: Maybe<Scalars['String']>;
  _lte?: Maybe<Scalars['String']>;
  _neq?: Maybe<Scalars['String']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: Maybe<Scalars['String']>;
  _nin?: Maybe<Array<Scalars['String']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: Maybe<Scalars['String']>;
  /** does the column NOT match the given pattern */
  _nlike?: Maybe<Scalars['String']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: Maybe<Scalars['String']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: Maybe<Scalars['String']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: Maybe<Scalars['String']>;
  /** does the column match the given SQL regular expression */
  _similar?: Maybe<Scalars['String']>;
};

/** columns and relationships of "activation" */
export type Activation = {
  __typename?: 'activation';
  code: Scalars['String'];
  created_at: Scalars['timestamp'];
  id: Scalars['uuid'];
  /** An array relationship */
  mangas: Array<Activation_Manga>;
  /** An aggregate relationship */
  mangas_aggregate: Activation_Manga_Aggregate;
  /** An object relationship */
  user: User;
  user_id: Scalars['uuid'];
};


/** columns and relationships of "activation" */
export type ActivationMangasArgs = {
  distinct_on?: Maybe<Array<Activation_Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Manga_Order_By>>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};


/** columns and relationships of "activation" */
export type ActivationMangas_AggregateArgs = {
  distinct_on?: Maybe<Array<Activation_Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Manga_Order_By>>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};

/** aggregated selection of "activation" */
export type Activation_Aggregate = {
  __typename?: 'activation_aggregate';
  aggregate?: Maybe<Activation_Aggregate_Fields>;
  nodes: Array<Activation>;
};

/** aggregate fields of "activation" */
export type Activation_Aggregate_Fields = {
  __typename?: 'activation_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Activation_Max_Fields>;
  min?: Maybe<Activation_Min_Fields>;
};


/** aggregate fields of "activation" */
export type Activation_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Activation_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "activation" */
export type Activation_Aggregate_Order_By = {
  count?: Maybe<Order_By>;
  max?: Maybe<Activation_Max_Order_By>;
  min?: Maybe<Activation_Min_Order_By>;
};

/** input type for inserting array relation for remote table "activation" */
export type Activation_Arr_Rel_Insert_Input = {
  data: Array<Activation_Insert_Input>;
  /** on conflict condition */
  on_conflict?: Maybe<Activation_On_Conflict>;
};

/** Boolean expression to filter rows from the table "activation". All fields are combined with a logical 'AND'. */
export type Activation_Bool_Exp = {
  _and?: Maybe<Array<Activation_Bool_Exp>>;
  _not?: Maybe<Activation_Bool_Exp>;
  _or?: Maybe<Array<Activation_Bool_Exp>>;
  code?: Maybe<String_Comparison_Exp>;
  created_at?: Maybe<Timestamp_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  mangas?: Maybe<Activation_Manga_Bool_Exp>;
  user?: Maybe<User_Bool_Exp>;
  user_id?: Maybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "activation" */
export type Activation_Constraint = 
  /** unique or primary key constraint */
  | 'activation_code_key'
  /** unique or primary key constraint */
  | 'activation_pkey'
  /** unique or primary key constraint */
  | 'activation_user_id_code_key';

/** input type for inserting data into table "activation" */
export type Activation_Insert_Input = {
  code?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamp']>;
  id?: Maybe<Scalars['uuid']>;
  mangas?: Maybe<Activation_Manga_Arr_Rel_Insert_Input>;
  user?: Maybe<User_Obj_Rel_Insert_Input>;
  user_id?: Maybe<Scalars['uuid']>;
};

/** columns and relationships of "activation_manga" */
export type Activation_Manga = {
  __typename?: 'activation_manga';
  /** An object relationship */
  activation: Activation;
  activation_id: Scalars['uuid'];
  /** An object relationship */
  manga: Manga;
  manga_id: Scalars['uuid'];
};

/** aggregated selection of "activation_manga" */
export type Activation_Manga_Aggregate = {
  __typename?: 'activation_manga_aggregate';
  aggregate?: Maybe<Activation_Manga_Aggregate_Fields>;
  nodes: Array<Activation_Manga>;
};

/** aggregate fields of "activation_manga" */
export type Activation_Manga_Aggregate_Fields = {
  __typename?: 'activation_manga_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Activation_Manga_Max_Fields>;
  min?: Maybe<Activation_Manga_Min_Fields>;
};


/** aggregate fields of "activation_manga" */
export type Activation_Manga_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Activation_Manga_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "activation_manga" */
export type Activation_Manga_Aggregate_Order_By = {
  count?: Maybe<Order_By>;
  max?: Maybe<Activation_Manga_Max_Order_By>;
  min?: Maybe<Activation_Manga_Min_Order_By>;
};

/** input type for inserting array relation for remote table "activation_manga" */
export type Activation_Manga_Arr_Rel_Insert_Input = {
  data: Array<Activation_Manga_Insert_Input>;
  /** on conflict condition */
  on_conflict?: Maybe<Activation_Manga_On_Conflict>;
};

/** Boolean expression to filter rows from the table "activation_manga". All fields are combined with a logical 'AND'. */
export type Activation_Manga_Bool_Exp = {
  _and?: Maybe<Array<Activation_Manga_Bool_Exp>>;
  _not?: Maybe<Activation_Manga_Bool_Exp>;
  _or?: Maybe<Array<Activation_Manga_Bool_Exp>>;
  activation?: Maybe<Activation_Bool_Exp>;
  activation_id?: Maybe<Uuid_Comparison_Exp>;
  manga?: Maybe<Manga_Bool_Exp>;
  manga_id?: Maybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "activation_manga" */
export type Activation_Manga_Constraint = 
  /** unique or primary key constraint */
  | 'activation_manga_pkey';

/** input type for inserting data into table "activation_manga" */
export type Activation_Manga_Insert_Input = {
  activation?: Maybe<Activation_Obj_Rel_Insert_Input>;
  activation_id?: Maybe<Scalars['uuid']>;
  manga?: Maybe<Manga_Obj_Rel_Insert_Input>;
  manga_id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type Activation_Manga_Max_Fields = {
  __typename?: 'activation_manga_max_fields';
  activation_id?: Maybe<Scalars['uuid']>;
  manga_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "activation_manga" */
export type Activation_Manga_Max_Order_By = {
  activation_id?: Maybe<Order_By>;
  manga_id?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Activation_Manga_Min_Fields = {
  __typename?: 'activation_manga_min_fields';
  activation_id?: Maybe<Scalars['uuid']>;
  manga_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "activation_manga" */
export type Activation_Manga_Min_Order_By = {
  activation_id?: Maybe<Order_By>;
  manga_id?: Maybe<Order_By>;
};

/** response of any mutation on the table "activation_manga" */
export type Activation_Manga_Mutation_Response = {
  __typename?: 'activation_manga_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Activation_Manga>;
};

/** on conflict condition type for table "activation_manga" */
export type Activation_Manga_On_Conflict = {
  constraint: Activation_Manga_Constraint;
  update_columns: Array<Activation_Manga_Update_Column>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};

/** Ordering options when selecting data from "activation_manga". */
export type Activation_Manga_Order_By = {
  activation?: Maybe<Activation_Order_By>;
  activation_id?: Maybe<Order_By>;
  manga?: Maybe<Manga_Order_By>;
  manga_id?: Maybe<Order_By>;
};

/** primary key columns input for table: activation_manga */
export type Activation_Manga_Pk_Columns_Input = {
  activation_id: Scalars['uuid'];
  manga_id: Scalars['uuid'];
};

/** select columns of table "activation_manga" */
export type Activation_Manga_Select_Column = 
  /** column name */
  | 'activation_id'
  /** column name */
  | 'manga_id';

/** input type for updating data in table "activation_manga" */
export type Activation_Manga_Set_Input = {
  activation_id?: Maybe<Scalars['uuid']>;
  manga_id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "activation_manga" */
export type Activation_Manga_Update_Column = 
  /** column name */
  | 'activation_id'
  /** column name */
  | 'manga_id';

/** aggregate max on columns */
export type Activation_Max_Fields = {
  __typename?: 'activation_max_fields';
  code?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamp']>;
  id?: Maybe<Scalars['uuid']>;
  user_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "activation" */
export type Activation_Max_Order_By = {
  code?: Maybe<Order_By>;
  created_at?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  user_id?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Activation_Min_Fields = {
  __typename?: 'activation_min_fields';
  code?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamp']>;
  id?: Maybe<Scalars['uuid']>;
  user_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "activation" */
export type Activation_Min_Order_By = {
  code?: Maybe<Order_By>;
  created_at?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  user_id?: Maybe<Order_By>;
};

/** response of any mutation on the table "activation" */
export type Activation_Mutation_Response = {
  __typename?: 'activation_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Activation>;
};

/** input type for inserting object relation for remote table "activation" */
export type Activation_Obj_Rel_Insert_Input = {
  data: Activation_Insert_Input;
  /** on conflict condition */
  on_conflict?: Maybe<Activation_On_Conflict>;
};

/** on conflict condition type for table "activation" */
export type Activation_On_Conflict = {
  constraint: Activation_Constraint;
  update_columns: Array<Activation_Update_Column>;
  where?: Maybe<Activation_Bool_Exp>;
};

/** Ordering options when selecting data from "activation". */
export type Activation_Order_By = {
  code?: Maybe<Order_By>;
  created_at?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  mangas_aggregate?: Maybe<Activation_Manga_Aggregate_Order_By>;
  user?: Maybe<User_Order_By>;
  user_id?: Maybe<Order_By>;
};

/** primary key columns input for table: activation */
export type Activation_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "activation" */
export type Activation_Select_Column = 
  /** column name */
  | 'code'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'user_id';

/** input type for updating data in table "activation" */
export type Activation_Set_Input = {
  code?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamp']>;
  id?: Maybe<Scalars['uuid']>;
  user_id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "activation" */
export type Activation_Update_Column = 
  /** column name */
  | 'code'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'user_id';


/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  /** is the column contained in the given json value */
  _contained_in?: Maybe<Scalars['jsonb']>;
  /** does the column contain the given json value at the top level */
  _contains?: Maybe<Scalars['jsonb']>;
  _eq?: Maybe<Scalars['jsonb']>;
  _gt?: Maybe<Scalars['jsonb']>;
  _gte?: Maybe<Scalars['jsonb']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: Maybe<Scalars['String']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: Maybe<Array<Scalars['String']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: Maybe<Array<Scalars['String']>>;
  _in?: Maybe<Array<Scalars['jsonb']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['jsonb']>;
  _lte?: Maybe<Scalars['jsonb']>;
  _neq?: Maybe<Scalars['jsonb']>;
  _nin?: Maybe<Array<Scalars['jsonb']>>;
};

/** columns and relationships of "manga" */
export type Manga = {
  __typename?: 'manga';
  /** An array relationship */
  activations: Array<Activation_Manga>;
  /** An aggregate relationship */
  activations_aggregate: Activation_Manga_Aggregate;
  cooldown: Scalars['timestamptz'];
  created_at: Scalars['timestamptz'];
  files: Scalars['jsonb'];
  id: Scalars['uuid'];
  name: Scalars['String'];
  thumbnail: Scalars['String'];
  updated_at: Scalars['timestamptz'];
};


/** columns and relationships of "manga" */
export type MangaActivationsArgs = {
  distinct_on?: Maybe<Array<Activation_Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Manga_Order_By>>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};


/** columns and relationships of "manga" */
export type MangaActivations_AggregateArgs = {
  distinct_on?: Maybe<Array<Activation_Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Manga_Order_By>>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};


/** columns and relationships of "manga" */
export type MangaFilesArgs = {
  path?: Maybe<Scalars['String']>;
};

/** aggregated selection of "manga" */
export type Manga_Aggregate = {
  __typename?: 'manga_aggregate';
  aggregate?: Maybe<Manga_Aggregate_Fields>;
  nodes: Array<Manga>;
};

/** aggregate fields of "manga" */
export type Manga_Aggregate_Fields = {
  __typename?: 'manga_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Manga_Max_Fields>;
  min?: Maybe<Manga_Min_Fields>;
};


/** aggregate fields of "manga" */
export type Manga_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Manga_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Manga_Append_Input = {
  files?: Maybe<Scalars['jsonb']>;
};

/** Boolean expression to filter rows from the table "manga". All fields are combined with a logical 'AND'. */
export type Manga_Bool_Exp = {
  _and?: Maybe<Array<Manga_Bool_Exp>>;
  _not?: Maybe<Manga_Bool_Exp>;
  _or?: Maybe<Array<Manga_Bool_Exp>>;
  activations?: Maybe<Activation_Manga_Bool_Exp>;
  cooldown?: Maybe<Timestamptz_Comparison_Exp>;
  created_at?: Maybe<Timestamptz_Comparison_Exp>;
  files?: Maybe<Jsonb_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  name?: Maybe<String_Comparison_Exp>;
  thumbnail?: Maybe<String_Comparison_Exp>;
  updated_at?: Maybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "manga" */
export type Manga_Constraint = 
  /** unique or primary key constraint */
  | 'file_pkey';

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Manga_Delete_At_Path_Input = {
  files?: Maybe<Array<Scalars['String']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Manga_Delete_Elem_Input = {
  files?: Maybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Manga_Delete_Key_Input = {
  files?: Maybe<Scalars['String']>;
};

/** input type for inserting data into table "manga" */
export type Manga_Insert_Input = {
  activations?: Maybe<Activation_Manga_Arr_Rel_Insert_Input>;
  cooldown?: Maybe<Scalars['timestamptz']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  files?: Maybe<Scalars['jsonb']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Manga_Max_Fields = {
  __typename?: 'manga_max_fields';
  cooldown?: Maybe<Scalars['timestamptz']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate min on columns */
export type Manga_Min_Fields = {
  __typename?: 'manga_min_fields';
  cooldown?: Maybe<Scalars['timestamptz']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** response of any mutation on the table "manga" */
export type Manga_Mutation_Response = {
  __typename?: 'manga_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Manga>;
};

/** input type for inserting object relation for remote table "manga" */
export type Manga_Obj_Rel_Insert_Input = {
  data: Manga_Insert_Input;
  /** on conflict condition */
  on_conflict?: Maybe<Manga_On_Conflict>;
};

/** on conflict condition type for table "manga" */
export type Manga_On_Conflict = {
  constraint: Manga_Constraint;
  update_columns: Array<Manga_Update_Column>;
  where?: Maybe<Manga_Bool_Exp>;
};

/** Ordering options when selecting data from "manga". */
export type Manga_Order_By = {
  activations_aggregate?: Maybe<Activation_Manga_Aggregate_Order_By>;
  cooldown?: Maybe<Order_By>;
  created_at?: Maybe<Order_By>;
  files?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  name?: Maybe<Order_By>;
  thumbnail?: Maybe<Order_By>;
  updated_at?: Maybe<Order_By>;
};

/** primary key columns input for table: manga */
export type Manga_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Manga_Prepend_Input = {
  files?: Maybe<Scalars['jsonb']>;
};

/** select columns of table "manga" */
export type Manga_Select_Column = 
  /** column name */
  | 'cooldown'
  /** column name */
  | 'created_at'
  /** column name */
  | 'files'
  /** column name */
  | 'id'
  /** column name */
  | 'name'
  /** column name */
  | 'thumbnail'
  /** column name */
  | 'updated_at';

/** input type for updating data in table "manga" */
export type Manga_Set_Input = {
  cooldown?: Maybe<Scalars['timestamptz']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  files?: Maybe<Scalars['jsonb']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** update columns of table "manga" */
export type Manga_Update_Column = 
  /** column name */
  | 'cooldown'
  /** column name */
  | 'created_at'
  /** column name */
  | 'files'
  /** column name */
  | 'id'
  /** column name */
  | 'name'
  /** column name */
  | 'thumbnail'
  /** column name */
  | 'updated_at';

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "activation" */
  delete_activation?: Maybe<Activation_Mutation_Response>;
  /** delete single row from the table: "activation" */
  delete_activation_by_pk?: Maybe<Activation>;
  /** delete data from the table: "activation_manga" */
  delete_activation_manga?: Maybe<Activation_Manga_Mutation_Response>;
  /** delete single row from the table: "activation_manga" */
  delete_activation_manga_by_pk?: Maybe<Activation_Manga>;
  /** delete data from the table: "manga" */
  delete_manga?: Maybe<Manga_Mutation_Response>;
  /** delete single row from the table: "manga" */
  delete_manga_by_pk?: Maybe<Manga>;
  /** delete data from the table: "role" */
  delete_role?: Maybe<Role_Mutation_Response>;
  /** delete single row from the table: "role" */
  delete_role_by_pk?: Maybe<Role>;
  /** delete data from the table: "short_url" */
  delete_short_url?: Maybe<Short_Url_Mutation_Response>;
  /** delete single row from the table: "short_url" */
  delete_short_url_by_pk?: Maybe<Short_Url>;
  /** delete data from the table: "user" */
  delete_user?: Maybe<User_Mutation_Response>;
  /** delete single row from the table: "user" */
  delete_user_by_pk?: Maybe<User>;
  /** insert data into the table: "activation" */
  insert_activation?: Maybe<Activation_Mutation_Response>;
  /** insert data into the table: "activation_manga" */
  insert_activation_manga?: Maybe<Activation_Manga_Mutation_Response>;
  /** insert a single row into the table: "activation_manga" */
  insert_activation_manga_one?: Maybe<Activation_Manga>;
  /** insert a single row into the table: "activation" */
  insert_activation_one?: Maybe<Activation>;
  /** insert data into the table: "manga" */
  insert_manga?: Maybe<Manga_Mutation_Response>;
  /** insert a single row into the table: "manga" */
  insert_manga_one?: Maybe<Manga>;
  /** insert data into the table: "role" */
  insert_role?: Maybe<Role_Mutation_Response>;
  /** insert a single row into the table: "role" */
  insert_role_one?: Maybe<Role>;
  /** insert data into the table: "short_url" */
  insert_short_url?: Maybe<Short_Url_Mutation_Response>;
  /** insert a single row into the table: "short_url" */
  insert_short_url_one?: Maybe<Short_Url>;
  /** insert data into the table: "user" */
  insert_user?: Maybe<User_Mutation_Response>;
  /** insert a single row into the table: "user" */
  insert_user_one?: Maybe<User>;
  /** update data of the table: "activation" */
  update_activation?: Maybe<Activation_Mutation_Response>;
  /** update single row of the table: "activation" */
  update_activation_by_pk?: Maybe<Activation>;
  /** update data of the table: "activation_manga" */
  update_activation_manga?: Maybe<Activation_Manga_Mutation_Response>;
  /** update single row of the table: "activation_manga" */
  update_activation_manga_by_pk?: Maybe<Activation_Manga>;
  /** update data of the table: "manga" */
  update_manga?: Maybe<Manga_Mutation_Response>;
  /** update single row of the table: "manga" */
  update_manga_by_pk?: Maybe<Manga>;
  /** update data of the table: "role" */
  update_role?: Maybe<Role_Mutation_Response>;
  /** update single row of the table: "role" */
  update_role_by_pk?: Maybe<Role>;
  /** update data of the table: "short_url" */
  update_short_url?: Maybe<Short_Url_Mutation_Response>;
  /** update single row of the table: "short_url" */
  update_short_url_by_pk?: Maybe<Short_Url>;
  /** update data of the table: "user" */
  update_user?: Maybe<User_Mutation_Response>;
  /** update single row of the table: "user" */
  update_user_by_pk?: Maybe<User>;
};


/** mutation root */
export type Mutation_RootDelete_ActivationArgs = {
  where: Activation_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Activation_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Activation_MangaArgs = {
  where: Activation_Manga_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Activation_Manga_By_PkArgs = {
  activation_id: Scalars['uuid'];
  manga_id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_MangaArgs = {
  where: Manga_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Manga_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_RoleArgs = {
  where: Role_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Role_By_PkArgs = {
  role: Scalars['String'];
};


/** mutation root */
export type Mutation_RootDelete_Short_UrlArgs = {
  where: Short_Url_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Short_Url_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_UserArgs = {
  where: User_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootInsert_ActivationArgs = {
  objects: Array<Activation_Insert_Input>;
  on_conflict?: Maybe<Activation_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Activation_MangaArgs = {
  objects: Array<Activation_Manga_Insert_Input>;
  on_conflict?: Maybe<Activation_Manga_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Activation_Manga_OneArgs = {
  object: Activation_Manga_Insert_Input;
  on_conflict?: Maybe<Activation_Manga_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Activation_OneArgs = {
  object: Activation_Insert_Input;
  on_conflict?: Maybe<Activation_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_MangaArgs = {
  objects: Array<Manga_Insert_Input>;
  on_conflict?: Maybe<Manga_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Manga_OneArgs = {
  object: Manga_Insert_Input;
  on_conflict?: Maybe<Manga_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_RoleArgs = {
  objects: Array<Role_Insert_Input>;
  on_conflict?: Maybe<Role_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Role_OneArgs = {
  object: Role_Insert_Input;
  on_conflict?: Maybe<Role_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Short_UrlArgs = {
  objects: Array<Short_Url_Insert_Input>;
  on_conflict?: Maybe<Short_Url_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Short_Url_OneArgs = {
  object: Short_Url_Insert_Input;
  on_conflict?: Maybe<Short_Url_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UserArgs = {
  objects: Array<User_Insert_Input>;
  on_conflict?: Maybe<User_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_OneArgs = {
  object: User_Insert_Input;
  on_conflict?: Maybe<User_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_ActivationArgs = {
  _set?: Maybe<Activation_Set_Input>;
  where: Activation_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Activation_By_PkArgs = {
  _set?: Maybe<Activation_Set_Input>;
  pk_columns: Activation_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Activation_MangaArgs = {
  _set?: Maybe<Activation_Manga_Set_Input>;
  where: Activation_Manga_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Activation_Manga_By_PkArgs = {
  _set?: Maybe<Activation_Manga_Set_Input>;
  pk_columns: Activation_Manga_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_MangaArgs = {
  _append?: Maybe<Manga_Append_Input>;
  _delete_at_path?: Maybe<Manga_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Manga_Delete_Elem_Input>;
  _delete_key?: Maybe<Manga_Delete_Key_Input>;
  _prepend?: Maybe<Manga_Prepend_Input>;
  _set?: Maybe<Manga_Set_Input>;
  where: Manga_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Manga_By_PkArgs = {
  _append?: Maybe<Manga_Append_Input>;
  _delete_at_path?: Maybe<Manga_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Manga_Delete_Elem_Input>;
  _delete_key?: Maybe<Manga_Delete_Key_Input>;
  _prepend?: Maybe<Manga_Prepend_Input>;
  _set?: Maybe<Manga_Set_Input>;
  pk_columns: Manga_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_RoleArgs = {
  _set?: Maybe<Role_Set_Input>;
  where: Role_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Role_By_PkArgs = {
  _set?: Maybe<Role_Set_Input>;
  pk_columns: Role_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Short_UrlArgs = {
  _inc?: Maybe<Short_Url_Inc_Input>;
  _set?: Maybe<Short_Url_Set_Input>;
  where: Short_Url_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Short_Url_By_PkArgs = {
  _inc?: Maybe<Short_Url_Inc_Input>;
  _set?: Maybe<Short_Url_Set_Input>;
  pk_columns: Short_Url_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_UserArgs = {
  _inc?: Maybe<User_Inc_Input>;
  _set?: Maybe<User_Set_Input>;
  where: User_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_By_PkArgs = {
  _inc?: Maybe<User_Inc_Input>;
  _set?: Maybe<User_Set_Input>;
  pk_columns: User_Pk_Columns_Input;
};

/** column ordering options */
export type Order_By = 
  /** in ascending order, nulls last */
  | 'asc'
  /** in ascending order, nulls first */
  | 'asc_nulls_first'
  /** in ascending order, nulls last */
  | 'asc_nulls_last'
  /** in descending order, nulls first */
  | 'desc'
  /** in descending order, nulls first */
  | 'desc_nulls_first'
  /** in descending order, nulls last */
  | 'desc_nulls_last';

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "activation" */
  activation: Array<Activation>;
  /** fetch aggregated fields from the table: "activation" */
  activation_aggregate: Activation_Aggregate;
  /** fetch data from the table: "activation" using primary key columns */
  activation_by_pk?: Maybe<Activation>;
  /** fetch data from the table: "activation_manga" */
  activation_manga: Array<Activation_Manga>;
  /** fetch aggregated fields from the table: "activation_manga" */
  activation_manga_aggregate: Activation_Manga_Aggregate;
  /** fetch data from the table: "activation_manga" using primary key columns */
  activation_manga_by_pk?: Maybe<Activation_Manga>;
  /** fetch data from the table: "manga" */
  manga: Array<Manga>;
  /** fetch aggregated fields from the table: "manga" */
  manga_aggregate: Manga_Aggregate;
  /** fetch data from the table: "manga" using primary key columns */
  manga_by_pk?: Maybe<Manga>;
  /** fetch data from the table: "role" */
  role: Array<Role>;
  /** fetch aggregated fields from the table: "role" */
  role_aggregate: Role_Aggregate;
  /** fetch data from the table: "role" using primary key columns */
  role_by_pk?: Maybe<Role>;
  /** fetch data from the table: "short_url" */
  short_url: Array<Short_Url>;
  /** fetch aggregated fields from the table: "short_url" */
  short_url_aggregate: Short_Url_Aggregate;
  /** fetch data from the table: "short_url" using primary key columns */
  short_url_by_pk?: Maybe<Short_Url>;
  /** fetch data from the table: "user" */
  user: Array<User>;
  /** fetch aggregated fields from the table: "user" */
  user_aggregate: User_Aggregate;
  /** fetch data from the table: "user" using primary key columns */
  user_by_pk?: Maybe<User>;
};


export type Query_RootActivationArgs = {
  distinct_on?: Maybe<Array<Activation_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Order_By>>;
  where?: Maybe<Activation_Bool_Exp>;
};


export type Query_RootActivation_AggregateArgs = {
  distinct_on?: Maybe<Array<Activation_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Order_By>>;
  where?: Maybe<Activation_Bool_Exp>;
};


export type Query_RootActivation_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootActivation_MangaArgs = {
  distinct_on?: Maybe<Array<Activation_Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Manga_Order_By>>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};


export type Query_RootActivation_Manga_AggregateArgs = {
  distinct_on?: Maybe<Array<Activation_Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Manga_Order_By>>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};


export type Query_RootActivation_Manga_By_PkArgs = {
  activation_id: Scalars['uuid'];
  manga_id: Scalars['uuid'];
};


export type Query_RootMangaArgs = {
  distinct_on?: Maybe<Array<Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Manga_Order_By>>;
  where?: Maybe<Manga_Bool_Exp>;
};


export type Query_RootManga_AggregateArgs = {
  distinct_on?: Maybe<Array<Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Manga_Order_By>>;
  where?: Maybe<Manga_Bool_Exp>;
};


export type Query_RootManga_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootRoleArgs = {
  distinct_on?: Maybe<Array<Role_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Role_Order_By>>;
  where?: Maybe<Role_Bool_Exp>;
};


export type Query_RootRole_AggregateArgs = {
  distinct_on?: Maybe<Array<Role_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Role_Order_By>>;
  where?: Maybe<Role_Bool_Exp>;
};


export type Query_RootRole_By_PkArgs = {
  role: Scalars['String'];
};


export type Query_RootShort_UrlArgs = {
  distinct_on?: Maybe<Array<Short_Url_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Short_Url_Order_By>>;
  where?: Maybe<Short_Url_Bool_Exp>;
};


export type Query_RootShort_Url_AggregateArgs = {
  distinct_on?: Maybe<Array<Short_Url_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Short_Url_Order_By>>;
  where?: Maybe<Short_Url_Bool_Exp>;
};


export type Query_RootShort_Url_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootUserArgs = {
  distinct_on?: Maybe<Array<User_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Order_By>>;
  where?: Maybe<User_Bool_Exp>;
};


export type Query_RootUser_AggregateArgs = {
  distinct_on?: Maybe<Array<User_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Order_By>>;
  where?: Maybe<User_Bool_Exp>;
};


export type Query_RootUser_By_PkArgs = {
  id: Scalars['uuid'];
};

/** columns and relationships of "role" */
export type Role = {
  __typename?: 'role';
  comment?: Maybe<Scalars['String']>;
  role: Scalars['String'];
  /** An array relationship */
  users: Array<User>;
  /** An aggregate relationship */
  users_aggregate: User_Aggregate;
};


/** columns and relationships of "role" */
export type RoleUsersArgs = {
  distinct_on?: Maybe<Array<User_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Order_By>>;
  where?: Maybe<User_Bool_Exp>;
};


/** columns and relationships of "role" */
export type RoleUsers_AggregateArgs = {
  distinct_on?: Maybe<Array<User_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Order_By>>;
  where?: Maybe<User_Bool_Exp>;
};

/** aggregated selection of "role" */
export type Role_Aggregate = {
  __typename?: 'role_aggregate';
  aggregate?: Maybe<Role_Aggregate_Fields>;
  nodes: Array<Role>;
};

/** aggregate fields of "role" */
export type Role_Aggregate_Fields = {
  __typename?: 'role_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Role_Max_Fields>;
  min?: Maybe<Role_Min_Fields>;
};


/** aggregate fields of "role" */
export type Role_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Role_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** Boolean expression to filter rows from the table "role". All fields are combined with a logical 'AND'. */
export type Role_Bool_Exp = {
  _and?: Maybe<Array<Role_Bool_Exp>>;
  _not?: Maybe<Role_Bool_Exp>;
  _or?: Maybe<Array<Role_Bool_Exp>>;
  comment?: Maybe<String_Comparison_Exp>;
  role?: Maybe<String_Comparison_Exp>;
  users?: Maybe<User_Bool_Exp>;
};

/** unique or primary key constraints on table "role" */
export type Role_Constraint = 
  /** unique or primary key constraint */
  | 'role_pkey';

export type Role_Enum = 
  | 'admin'
  | 'customer';

/** Boolean expression to compare columns of type "role_enum". All fields are combined with logical 'AND'. */
export type Role_Enum_Comparison_Exp = {
  _eq?: Maybe<Role_Enum>;
  _in?: Maybe<Array<Role_Enum>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _neq?: Maybe<Role_Enum>;
  _nin?: Maybe<Array<Role_Enum>>;
};

/** input type for inserting data into table "role" */
export type Role_Insert_Input = {
  comment?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  users?: Maybe<User_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Role_Max_Fields = {
  __typename?: 'role_max_fields';
  comment?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Role_Min_Fields = {
  __typename?: 'role_min_fields';
  comment?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "role" */
export type Role_Mutation_Response = {
  __typename?: 'role_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Role>;
};

/** on conflict condition type for table "role" */
export type Role_On_Conflict = {
  constraint: Role_Constraint;
  update_columns: Array<Role_Update_Column>;
  where?: Maybe<Role_Bool_Exp>;
};

/** Ordering options when selecting data from "role". */
export type Role_Order_By = {
  comment?: Maybe<Order_By>;
  role?: Maybe<Order_By>;
  users_aggregate?: Maybe<User_Aggregate_Order_By>;
};

/** primary key columns input for table: role */
export type Role_Pk_Columns_Input = {
  role: Scalars['String'];
};

/** select columns of table "role" */
export type Role_Select_Column = 
  /** column name */
  | 'comment'
  /** column name */
  | 'role';

/** input type for updating data in table "role" */
export type Role_Set_Input = {
  comment?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};

/** update columns of table "role" */
export type Role_Update_Column = 
  /** column name */
  | 'comment'
  /** column name */
  | 'role';

/** columns and relationships of "short_url" */
export type Short_Url = {
  __typename?: 'short_url';
  created_at: Scalars['timestamptz'];
  id: Scalars['Int'];
  url: Scalars['String'];
};

/** aggregated selection of "short_url" */
export type Short_Url_Aggregate = {
  __typename?: 'short_url_aggregate';
  aggregate?: Maybe<Short_Url_Aggregate_Fields>;
  nodes: Array<Short_Url>;
};

/** aggregate fields of "short_url" */
export type Short_Url_Aggregate_Fields = {
  __typename?: 'short_url_aggregate_fields';
  avg?: Maybe<Short_Url_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Short_Url_Max_Fields>;
  min?: Maybe<Short_Url_Min_Fields>;
  stddev?: Maybe<Short_Url_Stddev_Fields>;
  stddev_pop?: Maybe<Short_Url_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Short_Url_Stddev_Samp_Fields>;
  sum?: Maybe<Short_Url_Sum_Fields>;
  var_pop?: Maybe<Short_Url_Var_Pop_Fields>;
  var_samp?: Maybe<Short_Url_Var_Samp_Fields>;
  variance?: Maybe<Short_Url_Variance_Fields>;
};


/** aggregate fields of "short_url" */
export type Short_Url_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Short_Url_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Short_Url_Avg_Fields = {
  __typename?: 'short_url_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "short_url". All fields are combined with a logical 'AND'. */
export type Short_Url_Bool_Exp = {
  _and?: Maybe<Array<Short_Url_Bool_Exp>>;
  _not?: Maybe<Short_Url_Bool_Exp>;
  _or?: Maybe<Array<Short_Url_Bool_Exp>>;
  created_at?: Maybe<Timestamptz_Comparison_Exp>;
  id?: Maybe<Int_Comparison_Exp>;
  url?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "short_url" */
export type Short_Url_Constraint = 
  /** unique or primary key constraint */
  | 'short_url_pkey'
  /** unique or primary key constraint */
  | 'short_url_url_key';

/** input type for incrementing numeric columns in table "short_url" */
export type Short_Url_Inc_Input = {
  id?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "short_url" */
export type Short_Url_Insert_Input = {
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  url?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Short_Url_Max_Fields = {
  __typename?: 'short_url_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  url?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Short_Url_Min_Fields = {
  __typename?: 'short_url_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  url?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "short_url" */
export type Short_Url_Mutation_Response = {
  __typename?: 'short_url_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Short_Url>;
};

/** on conflict condition type for table "short_url" */
export type Short_Url_On_Conflict = {
  constraint: Short_Url_Constraint;
  update_columns: Array<Short_Url_Update_Column>;
  where?: Maybe<Short_Url_Bool_Exp>;
};

/** Ordering options when selecting data from "short_url". */
export type Short_Url_Order_By = {
  created_at?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  url?: Maybe<Order_By>;
};

/** primary key columns input for table: short_url */
export type Short_Url_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "short_url" */
export type Short_Url_Select_Column = 
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'url';

/** input type for updating data in table "short_url" */
export type Short_Url_Set_Input = {
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  url?: Maybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Short_Url_Stddev_Fields = {
  __typename?: 'short_url_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Short_Url_Stddev_Pop_Fields = {
  __typename?: 'short_url_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Short_Url_Stddev_Samp_Fields = {
  __typename?: 'short_url_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Short_Url_Sum_Fields = {
  __typename?: 'short_url_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "short_url" */
export type Short_Url_Update_Column = 
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'url';

/** aggregate var_pop on columns */
export type Short_Url_Var_Pop_Fields = {
  __typename?: 'short_url_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Short_Url_Var_Samp_Fields = {
  __typename?: 'short_url_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Short_Url_Variance_Fields = {
  __typename?: 'short_url_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "activation" */
  activation: Array<Activation>;
  /** fetch aggregated fields from the table: "activation" */
  activation_aggregate: Activation_Aggregate;
  /** fetch data from the table: "activation" using primary key columns */
  activation_by_pk?: Maybe<Activation>;
  /** fetch data from the table: "activation_manga" */
  activation_manga: Array<Activation_Manga>;
  /** fetch aggregated fields from the table: "activation_manga" */
  activation_manga_aggregate: Activation_Manga_Aggregate;
  /** fetch data from the table: "activation_manga" using primary key columns */
  activation_manga_by_pk?: Maybe<Activation_Manga>;
  /** fetch data from the table: "manga" */
  manga: Array<Manga>;
  /** fetch aggregated fields from the table: "manga" */
  manga_aggregate: Manga_Aggregate;
  /** fetch data from the table: "manga" using primary key columns */
  manga_by_pk?: Maybe<Manga>;
  /** fetch data from the table: "role" */
  role: Array<Role>;
  /** fetch aggregated fields from the table: "role" */
  role_aggregate: Role_Aggregate;
  /** fetch data from the table: "role" using primary key columns */
  role_by_pk?: Maybe<Role>;
  /** fetch data from the table: "short_url" */
  short_url: Array<Short_Url>;
  /** fetch aggregated fields from the table: "short_url" */
  short_url_aggregate: Short_Url_Aggregate;
  /** fetch data from the table: "short_url" using primary key columns */
  short_url_by_pk?: Maybe<Short_Url>;
  /** fetch data from the table: "user" */
  user: Array<User>;
  /** fetch aggregated fields from the table: "user" */
  user_aggregate: User_Aggregate;
  /** fetch data from the table: "user" using primary key columns */
  user_by_pk?: Maybe<User>;
};


export type Subscription_RootActivationArgs = {
  distinct_on?: Maybe<Array<Activation_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Order_By>>;
  where?: Maybe<Activation_Bool_Exp>;
};


export type Subscription_RootActivation_AggregateArgs = {
  distinct_on?: Maybe<Array<Activation_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Order_By>>;
  where?: Maybe<Activation_Bool_Exp>;
};


export type Subscription_RootActivation_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootActivation_MangaArgs = {
  distinct_on?: Maybe<Array<Activation_Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Manga_Order_By>>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};


export type Subscription_RootActivation_Manga_AggregateArgs = {
  distinct_on?: Maybe<Array<Activation_Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Manga_Order_By>>;
  where?: Maybe<Activation_Manga_Bool_Exp>;
};


export type Subscription_RootActivation_Manga_By_PkArgs = {
  activation_id: Scalars['uuid'];
  manga_id: Scalars['uuid'];
};


export type Subscription_RootMangaArgs = {
  distinct_on?: Maybe<Array<Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Manga_Order_By>>;
  where?: Maybe<Manga_Bool_Exp>;
};


export type Subscription_RootManga_AggregateArgs = {
  distinct_on?: Maybe<Array<Manga_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Manga_Order_By>>;
  where?: Maybe<Manga_Bool_Exp>;
};


export type Subscription_RootManga_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootRoleArgs = {
  distinct_on?: Maybe<Array<Role_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Role_Order_By>>;
  where?: Maybe<Role_Bool_Exp>;
};


export type Subscription_RootRole_AggregateArgs = {
  distinct_on?: Maybe<Array<Role_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Role_Order_By>>;
  where?: Maybe<Role_Bool_Exp>;
};


export type Subscription_RootRole_By_PkArgs = {
  role: Scalars['String'];
};


export type Subscription_RootShort_UrlArgs = {
  distinct_on?: Maybe<Array<Short_Url_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Short_Url_Order_By>>;
  where?: Maybe<Short_Url_Bool_Exp>;
};


export type Subscription_RootShort_Url_AggregateArgs = {
  distinct_on?: Maybe<Array<Short_Url_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Short_Url_Order_By>>;
  where?: Maybe<Short_Url_Bool_Exp>;
};


export type Subscription_RootShort_Url_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootUserArgs = {
  distinct_on?: Maybe<Array<User_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Order_By>>;
  where?: Maybe<User_Bool_Exp>;
};


export type Subscription_RootUser_AggregateArgs = {
  distinct_on?: Maybe<Array<User_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Order_By>>;
  where?: Maybe<User_Bool_Exp>;
};


export type Subscription_RootUser_By_PkArgs = {
  id: Scalars['uuid'];
};


/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: Maybe<Scalars['timestamp']>;
  _gt?: Maybe<Scalars['timestamp']>;
  _gte?: Maybe<Scalars['timestamp']>;
  _in?: Maybe<Array<Scalars['timestamp']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['timestamp']>;
  _lte?: Maybe<Scalars['timestamp']>;
  _neq?: Maybe<Scalars['timestamp']>;
  _nin?: Maybe<Array<Scalars['timestamp']>>;
};


/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: Maybe<Scalars['timestamptz']>;
  _gt?: Maybe<Scalars['timestamptz']>;
  _gte?: Maybe<Scalars['timestamptz']>;
  _in?: Maybe<Array<Scalars['timestamptz']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['timestamptz']>;
  _lte?: Maybe<Scalars['timestamptz']>;
  _neq?: Maybe<Scalars['timestamptz']>;
  _nin?: Maybe<Array<Scalars['timestamptz']>>;
};

/** columns and relationships of "user" */
export type User = {
  __typename?: 'user';
  /** An array relationship */
  activations: Array<Activation>;
  /** An aggregate relationship */
  activations_aggregate: Activation_Aggregate;
  banned: Scalars['Boolean'];
  created_at: Scalars['timestamptz'];
  first_name?: Maybe<Scalars['String']>;
  id: Scalars['uuid'];
  last_login_ip?: Maybe<Scalars['String']>;
  last_name?: Maybe<Scalars['String']>;
  photo_url?: Maybe<Scalars['String']>;
  register_ip?: Maybe<Scalars['String']>;
  role: Role_Enum;
  telegram_id: Scalars['Int'];
  updated_at: Scalars['timestamptz'];
  username?: Maybe<Scalars['String']>;
};


/** columns and relationships of "user" */
export type UserActivationsArgs = {
  distinct_on?: Maybe<Array<Activation_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Order_By>>;
  where?: Maybe<Activation_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserActivations_AggregateArgs = {
  distinct_on?: Maybe<Array<Activation_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Activation_Order_By>>;
  where?: Maybe<Activation_Bool_Exp>;
};

/** aggregated selection of "user" */
export type User_Aggregate = {
  __typename?: 'user_aggregate';
  aggregate?: Maybe<User_Aggregate_Fields>;
  nodes: Array<User>;
};

/** aggregate fields of "user" */
export type User_Aggregate_Fields = {
  __typename?: 'user_aggregate_fields';
  avg?: Maybe<User_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<User_Max_Fields>;
  min?: Maybe<User_Min_Fields>;
  stddev?: Maybe<User_Stddev_Fields>;
  stddev_pop?: Maybe<User_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Stddev_Samp_Fields>;
  sum?: Maybe<User_Sum_Fields>;
  var_pop?: Maybe<User_Var_Pop_Fields>;
  var_samp?: Maybe<User_Var_Samp_Fields>;
  variance?: Maybe<User_Variance_Fields>;
};


/** aggregate fields of "user" */
export type User_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<User_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "user" */
export type User_Aggregate_Order_By = {
  avg?: Maybe<User_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<User_Max_Order_By>;
  min?: Maybe<User_Min_Order_By>;
  stddev?: Maybe<User_Stddev_Order_By>;
  stddev_pop?: Maybe<User_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<User_Stddev_Samp_Order_By>;
  sum?: Maybe<User_Sum_Order_By>;
  var_pop?: Maybe<User_Var_Pop_Order_By>;
  var_samp?: Maybe<User_Var_Samp_Order_By>;
  variance?: Maybe<User_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "user" */
export type User_Arr_Rel_Insert_Input = {
  data: Array<User_Insert_Input>;
  /** on conflict condition */
  on_conflict?: Maybe<User_On_Conflict>;
};

/** aggregate avg on columns */
export type User_Avg_Fields = {
  __typename?: 'user_avg_fields';
  telegram_id?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "user" */
export type User_Avg_Order_By = {
  telegram_id?: Maybe<Order_By>;
};

/** Boolean expression to filter rows from the table "user". All fields are combined with a logical 'AND'. */
export type User_Bool_Exp = {
  _and?: Maybe<Array<User_Bool_Exp>>;
  _not?: Maybe<User_Bool_Exp>;
  _or?: Maybe<Array<User_Bool_Exp>>;
  activations?: Maybe<Activation_Bool_Exp>;
  banned?: Maybe<Boolean_Comparison_Exp>;
  created_at?: Maybe<Timestamptz_Comparison_Exp>;
  first_name?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  last_login_ip?: Maybe<String_Comparison_Exp>;
  last_name?: Maybe<String_Comparison_Exp>;
  photo_url?: Maybe<String_Comparison_Exp>;
  register_ip?: Maybe<String_Comparison_Exp>;
  role?: Maybe<Role_Enum_Comparison_Exp>;
  telegram_id?: Maybe<Int_Comparison_Exp>;
  updated_at?: Maybe<Timestamptz_Comparison_Exp>;
  username?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "user" */
export type User_Constraint = 
  /** unique or primary key constraint */
  | 'user_pkey'
  /** unique or primary key constraint */
  | 'user_telegram_id_key';

/** input type for incrementing numeric columns in table "user" */
export type User_Inc_Input = {
  telegram_id?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "user" */
export type User_Insert_Input = {
  activations?: Maybe<Activation_Arr_Rel_Insert_Input>;
  banned?: Maybe<Scalars['Boolean']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  first_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_login_ip?: Maybe<Scalars['String']>;
  last_name?: Maybe<Scalars['String']>;
  photo_url?: Maybe<Scalars['String']>;
  register_ip?: Maybe<Scalars['String']>;
  role?: Maybe<Role_Enum>;
  telegram_id?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  username?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type User_Max_Fields = {
  __typename?: 'user_max_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  first_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_login_ip?: Maybe<Scalars['String']>;
  last_name?: Maybe<Scalars['String']>;
  photo_url?: Maybe<Scalars['String']>;
  register_ip?: Maybe<Scalars['String']>;
  telegram_id?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  username?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "user" */
export type User_Max_Order_By = {
  created_at?: Maybe<Order_By>;
  first_name?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  last_login_ip?: Maybe<Order_By>;
  last_name?: Maybe<Order_By>;
  photo_url?: Maybe<Order_By>;
  register_ip?: Maybe<Order_By>;
  telegram_id?: Maybe<Order_By>;
  updated_at?: Maybe<Order_By>;
  username?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type User_Min_Fields = {
  __typename?: 'user_min_fields';
  created_at?: Maybe<Scalars['timestamptz']>;
  first_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_login_ip?: Maybe<Scalars['String']>;
  last_name?: Maybe<Scalars['String']>;
  photo_url?: Maybe<Scalars['String']>;
  register_ip?: Maybe<Scalars['String']>;
  telegram_id?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  username?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "user" */
export type User_Min_Order_By = {
  created_at?: Maybe<Order_By>;
  first_name?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  last_login_ip?: Maybe<Order_By>;
  last_name?: Maybe<Order_By>;
  photo_url?: Maybe<Order_By>;
  register_ip?: Maybe<Order_By>;
  telegram_id?: Maybe<Order_By>;
  updated_at?: Maybe<Order_By>;
  username?: Maybe<Order_By>;
};

/** response of any mutation on the table "user" */
export type User_Mutation_Response = {
  __typename?: 'user_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<User>;
};

/** input type for inserting object relation for remote table "user" */
export type User_Obj_Rel_Insert_Input = {
  data: User_Insert_Input;
  /** on conflict condition */
  on_conflict?: Maybe<User_On_Conflict>;
};

/** on conflict condition type for table "user" */
export type User_On_Conflict = {
  constraint: User_Constraint;
  update_columns: Array<User_Update_Column>;
  where?: Maybe<User_Bool_Exp>;
};

/** Ordering options when selecting data from "user". */
export type User_Order_By = {
  activations_aggregate?: Maybe<Activation_Aggregate_Order_By>;
  banned?: Maybe<Order_By>;
  created_at?: Maybe<Order_By>;
  first_name?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  last_login_ip?: Maybe<Order_By>;
  last_name?: Maybe<Order_By>;
  photo_url?: Maybe<Order_By>;
  register_ip?: Maybe<Order_By>;
  role?: Maybe<Order_By>;
  telegram_id?: Maybe<Order_By>;
  updated_at?: Maybe<Order_By>;
  username?: Maybe<Order_By>;
};

/** primary key columns input for table: user */
export type User_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "user" */
export type User_Select_Column = 
  /** column name */
  | 'banned'
  /** column name */
  | 'created_at'
  /** column name */
  | 'first_name'
  /** column name */
  | 'id'
  /** column name */
  | 'last_login_ip'
  /** column name */
  | 'last_name'
  /** column name */
  | 'photo_url'
  /** column name */
  | 'register_ip'
  /** column name */
  | 'role'
  /** column name */
  | 'telegram_id'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'username';

/** input type for updating data in table "user" */
export type User_Set_Input = {
  banned?: Maybe<Scalars['Boolean']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  first_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_login_ip?: Maybe<Scalars['String']>;
  last_name?: Maybe<Scalars['String']>;
  photo_url?: Maybe<Scalars['String']>;
  register_ip?: Maybe<Scalars['String']>;
  role?: Maybe<Role_Enum>;
  telegram_id?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  username?: Maybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type User_Stddev_Fields = {
  __typename?: 'user_stddev_fields';
  telegram_id?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "user" */
export type User_Stddev_Order_By = {
  telegram_id?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type User_Stddev_Pop_Fields = {
  __typename?: 'user_stddev_pop_fields';
  telegram_id?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "user" */
export type User_Stddev_Pop_Order_By = {
  telegram_id?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type User_Stddev_Samp_Fields = {
  __typename?: 'user_stddev_samp_fields';
  telegram_id?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "user" */
export type User_Stddev_Samp_Order_By = {
  telegram_id?: Maybe<Order_By>;
};

/** aggregate sum on columns */
export type User_Sum_Fields = {
  __typename?: 'user_sum_fields';
  telegram_id?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "user" */
export type User_Sum_Order_By = {
  telegram_id?: Maybe<Order_By>;
};

/** update columns of table "user" */
export type User_Update_Column = 
  /** column name */
  | 'banned'
  /** column name */
  | 'created_at'
  /** column name */
  | 'first_name'
  /** column name */
  | 'id'
  /** column name */
  | 'last_login_ip'
  /** column name */
  | 'last_name'
  /** column name */
  | 'photo_url'
  /** column name */
  | 'register_ip'
  /** column name */
  | 'role'
  /** column name */
  | 'telegram_id'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'username';

/** aggregate var_pop on columns */
export type User_Var_Pop_Fields = {
  __typename?: 'user_var_pop_fields';
  telegram_id?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "user" */
export type User_Var_Pop_Order_By = {
  telegram_id?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type User_Var_Samp_Fields = {
  __typename?: 'user_var_samp_fields';
  telegram_id?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "user" */
export type User_Var_Samp_Order_By = {
  telegram_id?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type User_Variance_Fields = {
  __typename?: 'user_variance_fields';
  telegram_id?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "user" */
export type User_Variance_Order_By = {
  telegram_id?: Maybe<Order_By>;
};


/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: Maybe<Scalars['uuid']>;
  _gt?: Maybe<Scalars['uuid']>;
  _gte?: Maybe<Scalars['uuid']>;
  _in?: Maybe<Array<Scalars['uuid']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['uuid']>;
  _lte?: Maybe<Scalars['uuid']>;
  _neq?: Maybe<Scalars['uuid']>;
  _nin?: Maybe<Array<Scalars['uuid']>>;
};

export type GetUrlQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetUrlQuery = (
  { __typename?: 'query_root' }
  & { short_url_by_pk?: Maybe<(
    { __typename?: 'short_url' }
    & Pick<Short_Url, 'url'>
  )> }
);

export type AddUrlMutationVariables = Exact<{
  url: Scalars['String'];
}>;


export type AddUrlMutation = (
  { __typename?: 'mutation_root' }
  & { insert_short_url_one?: Maybe<(
    { __typename?: 'short_url' }
    & Pick<Short_Url, 'id'>
  )> }
);


export const GetUrlDocument = gql`
    query GetUrl($id: Int!) {
  short_url_by_pk(id: $id) {
    url
  }
}
    `;
export const AddUrlDocument = gql`
    mutation AddUrl($url: String!) {
  insert_short_url_one(
    object: {url: $url}
    on_conflict: {constraint: short_url_url_key, update_columns: url}
  ) {
    id
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GetUrl(variables: GetUrlQueryVariables): Promise<GetUrlQuery> {
      return withWrapper(() => client.request<GetUrlQuery>(print(GetUrlDocument), variables));
    },
    AddUrl(variables: AddUrlMutationVariables): Promise<AddUrlMutation> {
      return withWrapper(() => client.request<AddUrlMutation>(print(AddUrlDocument), variables));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;