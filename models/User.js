import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
        trim: true,
    },
    bloodGroup: {
        type: String,
        required: [true, 'Please provide a blood group'],
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
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
    fcmToken: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['donor', 'requester', 'admin'],
        default: 'donor',
    },
    lastDonationDate: {
        type: Date,
        default: null,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Create a 2dsphere index on the location field
UserSchema.index({ location: '2dsphere' });

export default mongoose.models.User || mongoose.model('User', UserSchema);
