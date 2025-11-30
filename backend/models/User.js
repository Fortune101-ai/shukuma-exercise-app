import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
    streakCount: {
      type: Number,
      default: 0,
      min: [0, 'Streak count cannot be negative'],
    },
    lastWorkoutDate: {
      type: Date,
      default: null,
    },
    workoutHistory: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ExerciseCard',
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        completed: {
          type: Boolean,
          default: true,
        },
        duration: Number,
        notes: String,
      },
    ],
    tasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Task title cannot exceed 200 characters'],
        },
        completed: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    journal: [
      {
        title: {
          type: String,
          trim: true,
          maxlength: [200, 'Journal title cannot exceed 200 characters'],
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: [5000, 'Journal content cannot exceed 5000 characters'],
        },
        mood: {
          type: String,
          enum: ['great', 'good', 'okay', 'bad', 'terrible', null],
          default: null,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    foodLogs: [
      {
        date: {
          type: Date,
          required: true,
        },
        meals: [
          {
            name: String,
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number,
            time: String,
          },
        ],
        notes: {
          type: String,
          maxlength: [500, 'Food log notes cannot exceed 500 characters'],
        },
      },
    ],
    triggers: [
      {
        trigger: {
          type: String,
          required: true,
          trim: true,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: [500, 'Trigger notes cannot exceed 500 characters'],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      privacy: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'private',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ createdAt: -1 });
userSchema.index({ friends: 1 });

userSchema.virtual('totalWorkouts').get(function () {
  return this.workoutHistory.length;
});

userSchema.virtual('tasksCompleted').get(function () {
  return this.tasks.filter((task) => task.completed).length;
});

userSchema.virtual('totalTasks').get(function () {
  return this.tasks.length;
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.workedOutToday = function () {
  if (!this.lastWorkoutDate) return false;
  const today = new Date().toDateString();
  const lastWorkout = new Date(this.lastWorkoutDate).toDateString();
  return today === lastWorkout;
};

userSchema.methods.updateStreak = function () {
  const today = new Date().toDateString();
  const lastWorkoutDate = this.lastWorkoutDate
    ? new Date(this.lastWorkoutDate).toDateString()
    : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (!lastWorkoutDate || lastWorkoutDate === today) {
    return this.streakCount;
  } else if (lastWorkoutDate === yesterday) {
    this.streakCount += 1;
  } else {
    this.streakCount = 1;
  }

  return this.streakCount;
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;

  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  this.passwordHash = await bcrypt.hash(this.passwordHash, rounds);
});

userSchema.pre('save', function () {
  if (!this.username && this.email) {
    const emailPrefix = this.email.split('@')[0];
    this.username = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
});

export default mongoose.model('User', userSchema);
