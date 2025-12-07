import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// 1) TypeScript interface describing ONE user document in MongoDB
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2) Define the schema: how a user document looks in the database
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,        // no two users with same email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// 3) "Pre-save" hook to hash password before saving to database
UserSchema.pre<IUser>('save', async function () {
  const user = this;

  // If the password field was not changed, do nothing
  if (!user.isModified('password')) {
    return;
  }

  const saltRounds = 10;
  const hashed = await bcrypt.hash(user.password, saltRounds);

  // Replace plain password with hashed password
  user.password = hashed;
});


// 4) Instance method to compare plain password with hashed password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(candidatePassword, user.password);
};

// 5) Create the model from schema
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
