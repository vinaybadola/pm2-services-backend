import { Schema, model } from 'mongoose';

const ServiceMetadataSchema = new Schema({
    pm2_name: { type: String, required: true, unique: true },
    domain_name: { type: String, default: '' },
    public_ip: { type: String, default: '' }, 
    private_ip: { type: String, default: '' }, 
    type: { type: String, enum: ['frontend', 'backend'], default: 'backend' },
    uuid : { type: String, required: true, unique: true },
}, { timestamps: true});

export default model('ServiceMetadata', ServiceMetadataSchema);