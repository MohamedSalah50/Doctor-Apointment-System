import { Injectable } from '@nestjs/common';
import {
  CreateOptions,
  DeleteResult,
  FilterQuery,
  FlattenMaps,
  HydratedDocument,
  Model,
  MongooseUpdateQueryOptions,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  Types,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
// import { DoctorStatusEnum } from 'src/common';

export type Lean<T> = FlattenMaps<T>;

@Injectable()
export abstract class DatabaseRepository<
  TRawDocument,
  TDocument = HydratedDocument<TRawDocument>,
> {
  constructor(protected model: Model<TDocument>) {}

  async create({
    data,
    options,
  }: {
    data: Partial<TRawDocument>[];
    options?: CreateOptions | undefined;
  }): Promise<TDocument[]> {
    return (await this.model.create(data, options)) || [];
  }

  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: RootFilterQuery<TRawDocument>;
    select?: ProjectionType<TRawDocument> | null;
    options?: QueryOptions<TDocument> | null;
  }): Promise<Lean<TDocument> | TDocument | null> {
    const doc = this.model.findOne(filter).select(select || '');
    if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
    if (options?.lean) doc.lean(options.lean);
    return await doc.exec();
  }

  async findById({
    id,
    options,
    select,
  }: {
    id?: Types.ObjectId;
    select?: string | null;
    options?: QueryOptions<TDocument> | null;
    populate?: string | PopulateOptions | (string | PopulateOptions)[];
  }): Promise<TDocument | Lean<TDocument> | null> {
    return await this.model.findById(id, select || null, options || undefined);

    // if (populate) {
    //   query = query.populate(populate);
    // }

    // return await query.exec();
  }

  async find({
    filter,
    select,
    options,
  }: {
    filter: RootFilterQuery<TDocument>;
    select?: ProjectionType<TDocument> | undefined;
    options?: QueryOptions<TDocument> | undefined;
  }): Promise<Lean<TDocument>[] | HydratedDocument<TDocument>[] | []> {
    const docs = this.model.find(filter || {}).select(select || '');

    if (options?.lean) {
      docs.lean(options.lean);
    }

    if (options) {
      docs.setOptions(options);
    }

    return await docs.exec();
  }

  async paginate({
    filter,
    options = {},
    select,
    page = 'all',
    size,
  }: {
    filter?: RootFilterQuery<TDocument>;
    select?: ProjectionType<TDocument> | undefined;
    options?: QueryOptions<TDocument> | undefined;
    page?: number | 'all';
    size?: number;
  }): Promise<{
    doc_count?: number;
    pages?: number;
    current_page?: number | undefined;
    limit?: number;
    result: TDocument[] | Lean<TDocument>[];
  }> {
    let doc_count: number | undefined = undefined;
    let pages: number = 1;

    if (page != 'all') {
      page = Math.floor(page < 1 ? 1 : page);
      options.limit = Math.floor(size || Number(process.env.PAGE_SIZE) || 2);
      options.skip = (page - 1) * options.limit;
      doc_count = await this.model.countDocuments(filter);
      pages = Math.ceil(doc_count / options.limit);
    }

    const result = await this.find({ filter: filter || {}, select, options });

    return {
      doc_count,
      pages: page == 'all' ? undefined : pages,
      current_page: page == 'all' ? undefined : page,
      limit: options.limit,
      result,
    };
  }

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: RootFilterQuery<TRawDocument>;
    update: UpdateQuery<TDocument>;
    options?: MongooseUpdateQueryOptions<TDocument> | null;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(
      filter,
      {
        $inc: {
          __v: 1,
        },
        ...update,
      },
      options,
    );
  }

  async findOneAndUpdate({
    filter,
    update,
    options = { new: true },
  }: {
    filter?: RootFilterQuery<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument> | null;
  }): Promise<TDocument | Lean<TDocument> | null> {
    if (Array.isArray(update)) {
      update.push({ $set: { __v: { $add: ['$__v', 1] } } });
      return await this.model.findOneAndUpdate(filter || {}, update, options);
    }
    return await this.model.findOneAndUpdate(
      filter || {},
      {
        ...update,
        $inc: {
          __v: 1,
        },
      },
      options,
    );
  }

  async findOneAndDelete({
    filter = {},
  }: {
    filter?: RootFilterQuery<TDocument>;
  }): Promise<TDocument | Lean<TDocument> | null> {
    return await this.model.findOneAndDelete(filter || {});
  }

  async deleteOne({
    filter,
  }: {
    filter: RootFilterQuery<TRawDocument>;
  }): Promise<DeleteResult> {
    return await this.model.deleteOne(filter);
  }

  async deleteMany({
    filter,
  }: {
    filter: FilterQuery<TDocument>;
  }): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany(filter).exec();

    return {
      deletedCount: result.deletedCount || 0,
    };
  }

  async softDelete(id: string | Types.ObjectId): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      deletedAt: new Date(),
      // status: DoctorStatusEnum.retired,
    });
  }
}
