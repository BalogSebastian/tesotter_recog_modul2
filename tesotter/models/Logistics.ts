import mongoose, { Document, Schema } from 'mongoose';

export interface ILogistics extends Document {
  from?: string;
  to?: string;
  loadingPlace?: string;
  loadingTime?: string;
  deliveryPlace?: string;
  deliveryTime?: string;
  freightRate?: string;
  paymentTerms?: string;
  loadingReference?: string;
  rawText?: string; // Új mező a nyers szövegnek
}

const LogisticsSchema: Schema = new Schema({
  from: { type: String },
  to: { type: String },
  loadingPlace: { type: String },
  loadingTime: { type: String },
  deliveryPlace: { type: String },
  deliveryTime: { type: String },
  freightRate: { type: String },
  paymentTerms: { type: String },
  loadingReference: { type: String },
  rawText: { type: String }, // Új mező a nyers szövegnek
}, {
  timestamps: true,
});

export const Logistics = (mongoose.models.spontexlogistics as mongoose.Model<ILogistics>) || mongoose.model<ILogistics>('spontexlogistics', LogisticsSchema);