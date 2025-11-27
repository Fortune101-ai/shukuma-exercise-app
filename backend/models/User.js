import mongoose from "mongoose"
import validator from "validator"

const workoutHistorySchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExerciseCard",
      required: [true, "Exercise ID is required"],
      validate: {
        validator: mongoose.Types.ObjectId.isValid,
        message: "Invalid exercise ID format",
      },
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    completed: {
      type: Boolean,
      required: [true, "Completion status is required"],
      default: false,
    },
    duration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      trim: true,
    },
  },
  { _id: true }
)

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"],
      minlength: [1, "Task title cannot be empty"],
    },
    completed: {
      type: Boolean,
      default: false,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
      immutable: true,
    },
  },
  { _id: true }
)

const journalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "journal title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      minlength: [1, "Title cannot be empty"],
    },
    content: {
      type: String,
      required: [true, "Journal content is required"],
      trim: true,
      maxlength: [10000, "Content cannot exceed 10000 characters"],
    },
    mood: {
      type: String,
      enum: {
        values: ["happy", "sad", "anxious", "calm", "energetic", "tired", "neutral"],
        message: "{VALUE} is not a valid mood",
      },
      trim: true,
      lowercase: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      immutable: true,
    },
  },
  { _id: true }
)

const foodLogSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator (value) {
          return value <= new Date()
        },
        message: "Date cannot be in the future",
      },
    },
    meals: {
      type: [String],
      validate: {
        validator (meals) {
          return meals.length > 0 && meals.length <= 10
        },
        message: "Must have between 1 and 10 meals logged per day",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  { _id: true }
)

const triggerSchema = new mongoose.Schema(
  {
    trigger: {
      type: String,
      required: [true, "Trigger description is required"],
      trim: true,
      maxlength: [300, "Trigger cannot exceed 300 characters"],
      minlength: [1, "Trigger cannot be empty"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      immutable: true,
    },
  },
  { _id: true }
)

const settingsSchema = new mongoose.Schema(
  {
    notifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: {
        values: ["light", "dark", "auto"],
        message: "{VALUE} is not a valid theme",
      },
      default: "light",
      lowercase: true,
    },
    privacy: {
      type: String,
      enum: {
        values: ["public", "private", "friends"],
        message: "{VALUE} is not a valid privacy setting",
      },
      default: "private",
      lowercase: true,
    },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) => validator.isEmail(email),
        message: "Please provide a valid email address",
      },
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
      minlength: [60, "Password hash is invalid"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationToken: {
      type: String,
      select: false,
      index: true,
      sparse: true,
    },
    resetToken: {
      type: String,
      select: false,
      index: true,
      sparse: true,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
      validate: {
        validator (value) {
          if (this.resetToken && !value) return false
          return true
        },
        message: "Reset token expiry is required when reset token is set",
      },
    },
    streakCount: {
      type: Number,
      default: 0,
      min: [0, "Streak count cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Streak count must be an integer",
      },
    },
    lastWorkoutDate: {
      type: Date,
      validate: {
        validator (value) {
          return !value || value <= new Date()
        },
        message: "Last workout date cannot be in the future",
      },
    },
    workoutHistory: {
      type: [workoutHistorySchema],
      default: [],
      validate: {
        validator (history) {
          return history.length <= 10000
        },
        message: "Workout history limit exceeded",
      },
    },
    tasks: {
      type: [taskSchema],
      default: [],
      validate: {
        validator (tasks) {
          return tasks.length <= 1000
        },
        message: "Task limit exceeded",
      },
    },
    journal: {
      type: [journalSchema],
      default: [],
      validate: {
        validator (entries) {
          return entries.length <= 5000
        },
        message: "Journal entries limit exceeded",
      },
    },
    foodLogs: {
      type: [foodLogSchema],
      default: [],
      validate: {
        validator (logs) {
          return logs.length <= 5000
        },
        message: "Food logs limit exceeded",
      },
    },
    triggers: {
      type: [triggerSchema],
      default: [],
      validate: {
        validator (triggers) {
          return triggers.length <= 2000
        },
        message: "Triggers limit exceeded",
      },
    },
    friends: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      validate: {
        validator (friends) {
          return friends.length === new Set(friends.map(String)).size && friends.length <= 500
        },
        message: "Friends list contains duplicates or exceeds limit",
      },
    },
    friendRequests: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      validate: {
        validator (requests) {
          return requests.length === new Set(requests.map(String)).size && requests.length <= 100
        },
        message: "Friend requests contain duplicates or exceed limit",
      },
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
)

userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ streakCount: -1 })
userSchema.index({ "workoutHistory.date": -1 })

userSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updatedAt = Date.now()
  }

  next()
})

userSchema.methods.addFriend = function (friendId) {
  if (!this.friends.includes(friendId)) {
    this.friends.push(friendId)
  }
}

userSchema.methods.removeFriend = function (friendId) {
  this.friends = this.friends.filter((id) => !id.equals(friendId))
}

userSchema.statics.findVerified = function () {
  return this.find({ verified: true })
}

userSchema.virtual("friendCount").get(function () {
  return this.friends.length
})

userSchema.set("toJSON", {
  virtuals: true,
  transform (doc, ret) {
    delete ret.passwordHash
    delete ret.verificationToken
    delete ret.resetToken
    delete ret.resetTokenExpiry
    delete ret.__v
    return ret
  },
})

userSchema.set("toObject", {
  virtuals: true,
})

export default mongoose.model("User", userSchema)
