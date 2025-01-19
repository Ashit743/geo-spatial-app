import mongoose, { Document, Schema } from 'mongoose';

export interface IDataset extends Document {
  name: string;
  file: string;
  visible: boolean;
  layerId: string;
  geojson: any;
  selected: boolean;
  user: mongoose.Types.ObjectId;
}

const DatasetSchema: Schema = new Schema({
  name: { type: String, required: true },
  file: { type: String, required: true },
  visible: { type: Boolean, default: true },
  layerId: { type: String, required: true },
  geojson: { type: Schema.Types.Mixed },
  selected: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IDataset>('Dataset', DatasetSchema);

