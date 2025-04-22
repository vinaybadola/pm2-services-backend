import mongoose from 'mongoose';
const { Schema } = mongoose;
import jwt from 'jsonwebtoken';
const { sign } = jwt; 
import pkg from 'bcryptjs';
const { hash, compare } = pkg;

const adminSchema = new Schema ({
    email : {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password : {
        type: String,
        required: true
    },
    tokens: [{ token: { type: String } }],

},{timestamps: true});

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
      const hashedPassword = await hash(this.password, 10);
      this.password = hashedPassword;
      next();
    } catch (error) {
      console.error(`Error while hashing password: ${error.message}`);
      next(error);
    }
  });

adminSchema.methods.comparePassword = function (password) {
    return compare(password, this.password);
};

adminSchema.methods.generateAuthToken = function() {
    const token = sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    this.tokens = [{ token }];
    return token;
}

export default mongoose.model('Admin', adminSchema);