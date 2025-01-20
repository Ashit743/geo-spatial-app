import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './users';

export interface IDataset extends Document {
  name: string;
  file: string;
  visible: boolean;
  layerId: string;
  geojson: any;
  selected: boolean;
  user: IUser['_id'];
  createdAt?: Date;
  updatedAt?: Date;
}

const DatasetSchema = new Schema<IDataset>({
  name: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  layerId: {
    type: String,
    required: true,
  },
  geojson: {
    type: Schema.Types.Mixed,
  },
  selected: {
    type: Boolean,
    default: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

// Create a compound index for user and name to ensure uniqueness per user
DatasetSchema.index({ user: 1, name: 1 }, { unique: true });

const Dataset = mongoose.model<IDataset>('Dataset', DatasetSchema);

export default Dataset;

