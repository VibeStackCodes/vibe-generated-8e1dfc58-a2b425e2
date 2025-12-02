/**
 * Task List Component
 * Displays tasks with filtering and organization
 */

import { useState } from 'react'
import type { Task } from '@/hooks/use-tasks'
import { formatDateForDisplay } from '@/utils/natural-language-parser'
import { TaskDetailModal } from '@/components/task-detail-modal'

export interface TaskListProps {
  tasks: Task[]
  onToggle?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onEdit?: (taskId: string, updates: Partial<Task>) => void
  groupBy?: 'date' | 'tag' | 'none'
  filter?: 'all' | 'active' | 'completed'
}

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onEdit,
  groupBy = 'date',
  filter = 'all',
}: TaskListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null)

  // Filter tasks based on completion status
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  // Filter by selected tag
  const finalTasks = selectedTag
    ? filteredTasks.filter((task) => task.tags.includes(selectedTag))
    : filteredTasks

  // Get all unique tags from tasks
  const allTags = Array.from(
    new Set(finalTasks.flatMap((task) => task.tags))
  ).sort()

  // Group tasks
  const groupedTasks = groupTasks(finalTasks, groupBy)

  return (
    <>
      <div className="space-y-4">
        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTag === null
                  ? 'bg-[#4B2FFF] text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#4B2FFF] text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                🏷️ {tag}
              </button>
            ))}
          </div>
        )}

      {/* Task Groups */}
      {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
        <div key={groupName}>
          {groupBy !== 'none' && (
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {groupName}
            </h3>
          )}
          <div className="space-y-2">
            {groupTasks.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No tasks
              </p>
            ) : (
              groupTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => onToggle?.(task.id)}
                  onDelete={() => onDelete?.(task.id)}
                  onEdit={() => setSelectedTaskForEdit(task)}
                />
              ))
            )}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {finalTasks.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedTag
              ? `No tasks with tag "${selectedTag}"`
              : 'No tasks'}
          </p>
        </div>
      )}
      </div>

      {/* Task Detail Modal */}
      {selectedTaskForEdit && (
        <TaskDetailModal
          task={selectedTaskForEdit}
          isOpen={true}
          onClose={() => setSelectedTaskForEdit(null)}
          onSave={(updates) => {
            onEdit?.(selectedTaskForEdit.id, updates)
            setSelectedTaskForEdit(null)
          }}
        />
      )}
    </>
  )
}

/**
 * Individual Task Item Component
 */
function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task
  onToggle?: () => void
  onDelete?: () => void
  onEdit?: () => void
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 transition-all ${
        task.completed
          ? 'bg-gray-100 opacity-60 dark:bg-gray-800'
          : 'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0"
        aria-label="Toggle task completion"
      >
        <div
          className={`h-5 w-5 rounded border-2 transition-all ${
            task.completed
              ? 'border-[#4B2FFF] bg-[#4B2FFF]'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {task.completed && (
            <svg
              className="h-full w-full text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-medium ${
            task.completed
              ? 'line-through text-gray-600 dark:text-gray-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {task.title}
        </h4>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
          {task.priority && task.priority !== 'medium' && (
            <span>
              {task.priority === 'high' ? '🔴' : '📊'} {task.priority}
            </span>
          )}
          {task.date && (
            <span>📅 {formatDateForDisplay(task.date)}</span>
          )}
          {task.time && <span>🕐 {task.time}</span>}
          {task.recurrence && task.recurrence !== 'none' && (
            <span>🔄 {task.recurrence}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex gap-2">
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-[#4B2FFF] dark:text-gray-500 dark:hover:text-[#4B2FFF]"
          aria-label="Edit task"
          title="Edit task"
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

/**
 * Group tasks by date, tag, or none
 */
function groupTasks(
  tasks: Task[],
  groupBy: 'date' | 'tag' | 'none'
): Record<string, Task[]> {
  if (groupBy === 'none') {
    return { Tasks: tasks }
  }

  if (groupBy === 'date') {
    const groups: Record<string, Task[]> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const overdue: Task[] = []
    const todaysTasks: Task[] = []
    const upcoming: Record<string, Task[]> = {}

    tasks.forEach((task) => {
      if (!task.date) {
        if (!groups['Undated']) groups['Undated'] = []
        groups['Undated'].push(task)
        return
      }

      const taskDate = new Date(task.date)

      if (taskDate < today) {
        overdue.push(task)
      } else if (taskDate < tomorrow) {
        todaysTasks.push(task)
      } else {
        const dateKey = formatDateForDisplay(taskDate)
        if (!upcoming[dateKey]) upcoming[dateKey] = []
        upcoming[dateKey].push(task)
      }
    })

    if (overdue.length > 0) groups['⚠️ Overdue'] = overdue
    if (todaysTasks.length > 0) groups['📅 Today'] = todaysTasks
    Object.assign(groups, upcoming)

    return groups
  }

  if (groupBy === 'tag') {
    const groups: Record<string, Task[]> = {}

    tasks.forEach((task) => {
      if (task.tags.length === 0) {
        if (!groups['No Tags']) groups['No Tags'] = []
        groups['No Tags'].push(task)
        return
      }

      task.tags.forEach((tag) => {
        const key = `🏷️ ${tag}`
        if (!groups[key]) groups[key] = []
        groups[key].push(task)
      })
    })

    return groups
  }

  return { Tasks: tasks }
}
