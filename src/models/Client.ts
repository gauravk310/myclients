import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactPerson {
    name: string;
    phone: string;
}

export interface IVisitHistory {
    _id?: mongoose.Types.ObjectId;
    visitDate: Date;
    visitedBy: mongoose.Types.ObjectId;
    status: 'pending' | 'visited' | 'rescheduled';
    feedback?: string;
    issues?: string;
    rescheduledDate?: Date;
    siteImages?: string[];
    contactPersonsCollected?: IContactPerson[];
    registrationCompleted?: boolean;
    registrationDetails?: string;
    paymentScreenshots?: string[];
    documentImages?: string[];
    createdAt: Date;
}

export interface IClient extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    address: string;
    mapLocationLink?: string;
    phone: string;
    assignedTo: mongoose.Types.ObjectId;
    assignedVisitDate: Date;
    meetingStatus: 'pending' | 'visited' | 'rescheduled';
    clientStatus: 'registered' | 'not_registered';
    visitHistory: IVisitHistory[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ContactPersonSchema = new Schema<IContactPerson>({
    name: { type: String, required: true },
    phone: { type: String, required: true },
});

const VisitHistorySchema = new Schema<IVisitHistory>({
    visitDate: { type: Date, required: true },
    visitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'visited', 'rescheduled'],
        default: 'pending',
    },
    feedback: { type: String },
    issues: { type: String },
    rescheduledDate: { type: Date },
    siteImages: [{ type: String }],
    contactPersonsCollected: [ContactPersonSchema],
    registrationCompleted: { type: Boolean, default: false },
    registrationDetails: { type: String },
    paymentScreenshots: [{ type: String }],
    documentImages: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

const ClientSchema = new Schema<IClient>(
    {
        name: {
            type: String,
            required: [true, 'Client name is required'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters'],
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
        },
        mapLocationLink: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assigned team member is required'],
        },
        assignedVisitDate: {
            type: Date,
            required: [true, 'Visit date is required'],
        },
        meetingStatus: {
            type: String,
            enum: ['pending', 'visited', 'rescheduled'],
            default: 'pending',
        },
        clientStatus: {
            type: String,
            enum: ['registered', 'not_registered'],
            default: 'not_registered',
        },
        visitHistory: [VisitHistorySchema],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
ClientSchema.index({ assignedTo: 1, assignedVisitDate: 1 });
ClientSchema.index({ meetingStatus: 1 });
ClientSchema.index({ clientStatus: 1 });

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;
