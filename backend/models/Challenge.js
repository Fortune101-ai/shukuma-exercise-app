import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: [
          'daily',
          'weekly',
          'monthly',
          'streak',
          'most-cards',
          'time-based',
          'group',
          'custom',
        ],
        message: '{VALUE} is not a valid challenge type',
      },
      required: [true, 'Challenge type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      minlength: [5, 'Challenge title must be at least 5 characters'],
      maxlength: [100, 'Challenge title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Challenge description is required'],
      trim: true,
      maxlength: [1000, 'Challenge description cannot exceed 1000 characters'],
    },
    rules: {
      type: String,
      trim: true,
      maxlength: [2000, 'Challenge rules cannot exceed 2000 characters'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    progress: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        value: {
          type: Number,
          default: 0,
          min: [0, 'Progress value cannot be negative'],
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    goal: {
      type: Number,
      required: [true, 'Challenge goal is required'],
      min: [1, 'Challenge goal must be at least 1'],
    },
    startDate: {
      type: Date,
      required: [true, 'Challenge start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    reward: {
      type: String,
      trim: true,
      maxlength: [200, 'Reward description cannot exceed 200 characters'],
    },
    badge: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      enum: [
        'Fitness',
        'Nutrition',
        'Wellness',
        'Mental Health',
        'Productivity',
      ],
      default: 'Fitness',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

challengeSchema.index({ type: 1, isActive: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });
challengeSchema.index({ isPublic: 1, isActive: 1 });
challengeSchema.index({ participants: 1 });

challengeSchema.virtual('participantCount').get(function () {
  return this.participants.length;
});

challengeSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

challengeSchema.virtual('isExpired').get(function () {
  return new Date() > new Date(this.endDate);
});

challengeSchema.virtual('isUpcoming').get(function () {
  return new Date() < new Date(this.startDate);
});

challengeSchema.virtual('isOngoing').get(function () {
  const now = new Date();
  return now >= new Date(this.startDate) && now <= new Date(this.endDate);
});

challengeSchema.methods.addParticipant = function (userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.progress.push({
      userId,
      value: 0,
      updatedAt: new Date(),
    });
  }

  return this.save();
};

challengeSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter(
    (id) => id.toString() !== userId.toString()
  );
  this.progress = this.progress.filter(
    (p) => p.userId.toString() !== userId.toString()
  );
  return this.save();
};

challengeSchema.methods.updateProgress = function (userId, value) {
  const userProgress = this.progress.find(
    (p) => p.userId.toString() === userId.toString()
  );
  if (userProgress) {
    userProgress.value = value;
    userProgress.updatedAt = new Date();
  } else {
    this.progress.push({
      userId,
      value,
      updatedAt: new Date(),
    });
  }
  return this.save();
};

challengeSchema.methods.getUserProgress = function (userId) {
  const userProgress = this.progress.find(
    (p) => p.userId.toString() === userId.toString()
  );
  return userProgress ? userProgress.value : 0;
};

challengeSchema.methods.getLeaderboard = async function () {
  await this.populate('progress.userId', 'name username');
  return this.progress
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((p) => ({
      user: p.userId,
      progress: p.value,
      percentage: Math.round((p.value / this.goal) * 100),
    }));
};

challengeSchema.statics.getActive = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ createdAt: -1 });
};

challengeSchema.statics.getUpcoming = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $gt: now },
  }).sort({ startDate: 1 });
};

challengeSchema.statics.getUserChallenges = function (userId) {
  return this.find({
    participants: userId,
    isActive: true,
  }).sort({ endDate: 1 });
};

export default mongoose.model('Challenge', challengeSchema);
