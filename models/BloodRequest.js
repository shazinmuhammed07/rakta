import mongoose from 'mongoose';

const BloodRequestSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: [true, 'Please provide the patient name'],
        trim: true,
    },
    bloodGroup: {
        type: String,
        required: [true, 'Please provide the required blood group'],
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsRequired: {
        type: Number,
        required: [true, 'Please provide the number of units required'],
        min: 1,
    },
    hospitalName: {
        type: String,
        required: [true, 'Please provide the hospital name'],
        trim: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    locationName: {
        type: String,
        trim: true,
    },
    urgencyLevel: {
        type: String,
        enum: ['Normal', 'Urgent', 'Emergency'],
        default: 'Normal',
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'fulfilled', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });

// Create a 2dsphere index on the location field
BloodRequestSchema.index({ location: '2dsphere' });

export default mongoose.models.BloodRequest || mongoose.model('BloodRequest', BloodRequestSchema);
