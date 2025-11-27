import mongoose from 'mongoose';

const exerciseCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      unique: true,
      minlength: [3, 'Exercise name must be at least 3 characters'],
      maxlength: [100, 'Exercise name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced'],
        message:
          'Difficulty must be either Beginner, Intermediate, or Advanced',
      },
      required: [true, 'Difficulty level is required'],
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          'Cardio',
          'Strength',
          'Flexibility',
          'Balance',
          'HIIT',
          'Yoga',
          'Pilates',
        ],
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [120, 'Duration cannot exceed 120 minutes'],
    },
    reps: {
      type: String,
      trim: true,
      maxlength: [100, 'Reps description cannot exceed 100 characters'],
    },
    sets: {
      type: Number,
      min: [1, 'Sets must be at least 1'],
      max: [10, 'Sets cannot exceed 10'],
    },
    caloriesBurned: {
      type: Number,
      min: [0, ' Calories burned cannot be negative'],
    },
    imageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please enter a valid image URL',
      },
    },
    videoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Video URL must be a valid URL',
      },
    },
    instructions: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: 'Cannot have more than 20 instruction steps',
      },
    },
    muscleGroups: {
      type: [String],
      enum: [
        'Chest',
        'Back',
        'Shoulders',
        'Arms',
        'Legs',
        'Core',
        'Full Body',
        'Cardio',
        'Glutes',
        'Hamstrings',
        'Quadriceps',
        'Calves',
        'Biceps',
        'Triceps',
        'Forearms',
        'Abs',
      ],
      default: [],
    },
    goal: {
      type: String,
      enum: [
        'Weight Loss',
        'Muscle Gain',
        'Endurance',
        'Flexibility',
        'General Fitness',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    completionCount: {
      type: Number,
      default: 0,
      min: [0, 'Completion count cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

exerciseCardSchema.index({ category: 1, difficulty: 1 });
exerciseCardSchema.index({ difficulty: 1, duration: 1 });
exerciseCardSchema.index({ isActive: 1, category: 1 });

exerciseCardSchema.virtual('difficultyDisplay').get(function () {
  const icons = {
    beginner: '🟢',
    intermediate: '🟠',
    advanced: '🔴',
  };
  return `${icons[this.difficulty]} ${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}`;
});

exerciseCardSchema.virtual('caloriesPerMinute').get(function () {
  if (!this.caloriesBurned || !this.duration) return 0;

  return Math.round(this.caloriesBurned / this.duration);
});

exerciseCardSchema.methods.incrementCompletion = function () {
  this.completionCount += 1;
  return this.save();
};

exerciseCardSchema.statics.getRandom = async function (filters = {}) {
  const query = { isActive: true, ...filters };
  const count = await this.countDocuments(query);
  if (count === 0) return null;
  const random = Math.floor(Math.random() * count);
  return this.findOne(query).skip(random);
};

exerciseCardSchema.statics.findByDifficulty = function (difficulty) {
  return this.find({ difficulty, isActive: true }).sort({ name: 1 });
};

exerciseCardSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({
    difficulty: 1,
    name: 1,
  });
};

exerciseCardSchema.statics.search = function (searchTerm) {
  return this.find({
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ],
  }).sort({ name: 1 });
};

export default mongoose.model('ExerciseCard', exerciseCardSchema);
