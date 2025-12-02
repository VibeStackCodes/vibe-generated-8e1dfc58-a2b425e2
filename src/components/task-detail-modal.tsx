/**
 * Task Detail Modal Component
 * Provides editing capabilities for task title, description, priority, due date, tags, and recurrence
 */

import { useState, useEffect } from 'react'
import type { Task } from '@/hooks/use-tasks'
import { formatDateForDisplay } from '@/utils/natural-language-parser'

export interface TaskDetailModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onSave: (updates: Partial<Task>) => void
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSave,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    task.priority || 'medium'
  )
  const [dueDate, setDueDate] = useState<string>(
    task.date ? task.date.toISOString().split('T')[0] : ''
  )
  const [time, setTime] = useState(task.time || '')
  const [tags, setTags] = useState<string[]>(task.tags)
  const [tagInput, setTagInput] = useState('')
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(
    task.recurrence || 'none'
  )
  const [hasChanges, setHasChanges] = useState(false)

  // Track if any changes have been made
  useEffect(() => {
    const changed =
      title !== task.title ||
      description !== (task.description || '') ||
      priority !== (task.priority || 'medium') ||
      dueDate !== (task.date ? task.date.toISOString().split('T')[0] : '') ||
      time !== (task.time || '') ||
      JSON.stringify(tags) !== JSON.stringify(task.tags) ||
      recurrence !== (task.recurrence || 'none')
    setHasChanges(changed)
  }, [title, description, priority, dueDate, time, tags, recurrence, task])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSave = () => {
    const updates: Partial<Task> = {
      title,
      description: description || undefined,
      priority,
      date: dueDate ? new Date(dueDate) : null,
      time: time || null,
      tags,
      recurrence,
    }
    onSave(updates)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
          <div
            className="relative w-full transform rounded-lg bg-white shadow-xl transition-all dark:bg-gray-900 sm:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Task
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 px-6 py-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#4B2FFF] focus:outline-none focus:ring-1 focus:ring-[#4B2FFF] dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  placeholder="Task title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#4B2FFF] focus:outline-none focus:ring-1 focus:ring-[#4B2FFF] dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  placeholder="Add a description (optional)"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <div className="mt-2 flex gap-2">
                  {(
                    [
                      { value: 'low', label: 'Low', icon: '📊' },
                      { value: 'medium', label: 'Medium', icon: '📈' },
                      { value: 'high', label: 'High', icon: '🔴' },
                    ] as const
                  ).map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setPriority(value)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        priority === value
                          ? 'bg-[#4B2FFF] text-white'
                          : 'border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="mr-1">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#4B2FFF] focus:outline-none focus:ring-1 focus:ring-[#4B2FFF] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#4B2FFF] focus:outline-none focus:ring-1 focus:ring-[#4B2FFF] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={() => setTime('')}
                    disabled={!time}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag()
                      }
                    }}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#4B2FFF] focus:outline-none focus:ring-1 focus:ring-[#4B2FFF] dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="rounded-lg bg-[#4B2FFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a21cc] disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {/* Display Tags */}
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100"
                          aria-label={`Remove tag ${tag}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recurrence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) =>
                    setRecurrence(e.target.value as typeof recurrence)
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#4B2FFF] focus:outline-none focus:ring-1 focus:ring-[#4B2FFF] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="none">No recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex-1 rounded-lg bg-[#4B2FFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a21cc] disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
