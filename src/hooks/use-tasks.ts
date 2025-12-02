/**
 * useT asks Hook
 * Manages task state and persistence for the quick-add component
 */

import { useState, useCallback, useEffect } from 'react'
import type { ParsedTask } from '@/utils/natural-language-parser'

export interface TaskList {
  id: string
  name: string
  color?: string
  createdAt: Date
}

export interface Task extends ParsedTask {
  id: string
  createdAt: Date
  completedAt?: Date
  completed: boolean
  description?: string
  priority?: 'low' | 'medium' | 'high'
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'
  listId?: string // Reference to the list/project this task belongs to
}

const STORAGE_KEY = 'notodo:tasks'
const LISTS_STORAGE_KEY = 'notodo:lists'

/**
 * Hook for managing tasks with localStorage persistence
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<TaskList[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load tasks and lists from localStorage
  useEffect(() => {
    try {
      // Load tasks
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Deserialize dates
        const tasks = parsed.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          date: task.date ? new Date(task.date) : null,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }))
        setTasks(tasks)
      }

      // Load lists
      const storedLists = localStorage.getItem(LISTS_STORAGE_KEY)
      if (storedLists) {
        const parsedLists = JSON.parse(storedLists)
        const lists = parsedLists.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
        }))
        setLists(lists)
      }
    } catch (error) {
      console.error('Failed to load tasks/lists from localStorage:', error)
    }
    setLoaded(true)
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error)
      }
    }
  }, [tasks, loaded])

  // Save lists to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists))
      } catch (error) {
        console.error('Failed to save lists to localStorage:', error)
      }
    }
  }, [lists, loaded])

  // Add a new task
  const addTask = useCallback(
    (parsed: ParsedTask) => {
      const newTask: Task = {
        ...parsed,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        completed: false,
      }
      setTasks((prev) => [newTask, ...prev])
      return newTask
    },
    []
  )

  // Update a task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    )
  }, [])

  // Delete a task
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  // Toggle task completion
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task
      )
    )
  }, [])

  // Get tasks for today
  const getTodaysTasks = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter((task) => {
      if (!task.date) return false
      const taskDate = new Date(task.date)
      return taskDate >= today && taskDate < tomorrow
    })
  }, [tasks])

  // Get overdue tasks
  const getOverdueTasks = useCallback(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return tasks.filter((task) => {
      if (!task.date || task.completed) return false
      const taskDate = new Date(task.date)
      return taskDate < now
    })
  }, [tasks])

  // Get upcoming tasks
  const getUpcomingTasks = useCallback(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return tasks.filter((task) => {
      if (!task.date || task.completed) return false
      const taskDate = new Date(task.date)
      return taskDate >= now
    })
  }, [tasks])

  // Get tasks by tag
  const getTasksByTag = useCallback(
    (tag: string) => {
      return tasks.filter((task) => task.tags.includes(tag))
    },
    [tasks]
  )

  // Get all unique tags
  const getAllTags = useCallback(() => {
    const tags = new Set<string>()
    tasks.forEach((task) => {
      task.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [tasks])

  // Get inbox tasks (tasks without a listId, unsorted captures)
  const getInboxTasks = useCallback(() => {
    return tasks.filter((task) => !task.listId)
  }, [tasks])

  // Get tasks by list
  const getTasksByList = useCallback(
    (listId: string) => {
      return tasks.filter((task) => task.listId === listId)
    },
    [tasks]
  )

  // Move task to list
  const moveTaskToList = useCallback((taskId: string, listId: string | null) => {
    updateTask(taskId, { listId: listId || undefined })
  }, [updateTask])

  // Create a new list
  const createList = useCallback((name: string, color?: string) => {
    const newList: TaskList = {
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      createdAt: new Date(),
    }
    setLists((prev) => [newList, ...prev])
    return newList
  }, [])

  // Update a list
  const updateList = useCallback((id: string, updates: Partial<TaskList>) => {
    setLists((prev) =>
      prev.map((list) => (list.id === id ? { ...list, ...updates } : list))
    )
  }, [])

  // Delete a list
  const deleteList = useCallback((id: string) => {
    setLists((prev) => prev.filter((list) => list.id !== id))
    // Move all tasks from this list back to inbox
    setTasks((prev) =>
      prev.map((task) => (task.listId === id ? { ...task, listId: undefined } : task))
    )
  }, [])

  return {
    tasks,
    lists,
    loaded,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTodaysTasks,
    getOverdueTasks,
    getUpcomingTasks,
    getTasksByTag,
    getAllTags,
    getInboxTasks,
    getTasksByList,
    moveTaskToList,
    createList,
    updateList,
    deleteList,
  }
}
