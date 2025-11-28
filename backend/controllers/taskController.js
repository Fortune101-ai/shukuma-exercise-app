import User from "../models/User.js"
import { NotFoundError } from "../middleware/errorHandler.js"
import {parsePagination, getPaginationMeta} from "../utils/helpers.js"
import logger from "../utils/logger.js"

export const createTask = async (req,res)=>{
    const {title} = req.body

    const user = await User.findById(req.userId)

    if (!user) {
        throw new NotFoundError("User")
    }

    user.tasks.push({
        title,
        completed:false,
    })

    await user.save()

    const newTask = user.tasks[user.tasks.length -1]

    logger.info(`Task created: "${title}" by user ${user.email}`)

    res.status(201).json({
        message:"Task created successfully",
        task:newTask
    })
}

export const getTasks = async (req,res) => {
    const {completed, search} = req.query
    const {page, limit, skip} = parsePagination(req.query)

    const user = await User.findById(req.userId)

    if (!user) {
        throw new NotFoundError("User")
    }

    let tasks = user.tasks

    if (completed !== undefined) {
        const isCompleted = completed === "true"
        tasks = tasks.filter((task)=> task.completed === isCompleted)
    }

    if (search) {
        const searchLower = search.toLowerCase()
        tasks = tasks,filter((task)=> task.title.toLowerCase().includes(searchLower))
    }

    tasks = tasks.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = tasks.length
    const paginatedTasks = tasks.slice(skip, skip + limit)

    res.json({
        tasks:paginatedTasks,
        pagination:getPaginationMeta(page,limit, total),
        summary: {
            total:user.tasks.length,
            completed:user.tasks.filter((t)=>t.completed).length,
            pending:user.tasks.filter((t)=>!t.completed).length
        }
    })
}

export const getTaskById = async (req, res) => {
  const { taskId } = req.params

  const user = await User.findById(req.userId)

  if (!user) {
    throw new NotFoundError("User")
  }

  const task = user.tasks.id(taskId)

  if (!task) {
    throw new NotFoundError("Task")
  }

  res.json({
    task,
  })
}

export const updateTask = async (req, res) => {
  const { taskId } = req.params
  const { title, completed } = req.body

  const user = await User.findById(req.userId)

  if (!user) {
    throw new NotFoundError("User")
  }

  const task = user.tasks.id(taskId)

  if (!task) {
    throw new NotFoundError("Task")
  }

  // Update fields
  if (title !== undefined) {
    task.title = title
  }
  if (completed !== undefined) {
    task.completed = completed
  }

  await user.save()

  logger.info(`Task updated: ${taskId} by user ${user.email}`)

  res.json({
    message: "Task updated successfully",
    task,
  })
}

export const toggleTaskCompletion = async (req, res) => {
  const { taskId } = req.params

  const user = await User.findById(req.userId)

  if (!user) {
    throw new NotFoundError("User")
  }

  const task = user.tasks.id(taskId)

  if (!task) {
    throw new NotFoundError("Task")
  }

  // Toggle completion status
  task.completed = !task.completed

  await user.save()

  logger.info(`Task toggled: ${taskId} (${task.completed ? "completed" : "pending"}) by user ${user.email}`)

  res.json({
    message: task.completed ? "Task marked as completed" : "Task marked as pending",
    task,
  })
}

export const deleteTask = async (req, res) => {
  const { taskId } = req.params

  const user = await User.findById(req.userId)

  if (!user) {
    throw new NotFoundError("User")
  }

  const task = user.tasks.id(taskId)

  if (!task) {
    throw new NotFoundError("Task")
  }

  task.deleteOne()
  await user.save()

  logger.info(`Task deleted: ${taskId} by user ${user.email}`)

  res.json({
    message: "Task deleted successfully",
  })
}

export const deleteCompletedTasks = async (req, res) => {
  const user = await User.findById(req.userId)

  if (!user) {
    throw new NotFoundError("User")
  }

  const completedCount = user.tasks.filter((t) => t.completed).length

  // Remove all completed tasks
  user.tasks = user.tasks.filter((task) => !task.completed)

  await user.save()

  logger.info(`Deleted ${completedCount} completed tasks for user ${user.email}`)

  res.json({
    message: `${completedCount} completed task(s) deleted successfully`,
    deletedCount: completedCount,
  })
}

export const completeAllTasks = async (req, res) => {
  const user = await User.findById(req.userId)

  if (!user) {
    throw new NotFoundError("User")
  }

  let updatedCount = 0

  user.tasks.forEach((task) => {
    if (!task.completed) {
      task.completed = true
      updatedCount++
    }
  })

  await user.save()

  logger.info(`Marked ${updatedCount} tasks as completed for user ${user.email}`)

  res.json({
    message: `${updatedCount} task(s) marked as completed`,
    updatedCount,
  })
}

export const getTaskStats = async (req, res) => {
  const user = await User.findById(req.userId)

  if (!user) {
    throw new NotFoundError("User")
  }

  const totalTasks = user.tasks.length
  const completedTasks = user.tasks.filter((t) => t.completed).length
  const pendingTasks = user.tasks.filter((t) => !t.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Tasks created this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const tasksThisWeek = user.tasks.filter((t) => new Date(t.createdAt) > weekAgo).length

  // Tasks completed this week
  const completedThisWeek = user.tasks.filter(
    (t) => t.completed && new Date(t.createdAt) > weekAgo
  ).length

  res.json({
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate,
    tasksThisWeek,
    completedThisWeek,
  })
}