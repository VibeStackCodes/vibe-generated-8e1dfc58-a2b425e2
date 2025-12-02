/**
 * Inbox Page
 * Displays unsorted/newly captured tasks with ability to move them to lists
 */

import { useState } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import { QuickAddInput } from '@/components/quick-add-input'
import type { ParsedTask } from '@/utils/natural-language-parser'
import type { Task } from '@/hooks/use-tasks'
import { formatDateForDisplay } from '@/utils/natural-language-parser'
import { MoveToListModal } from '@/components/move-to-list-modal'
import { TaskDetailModal } from '@/components/task-detail-modal'

export function InboxPage() {
  const {
    tasks,
    lists,
    loaded,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getInboxTasks,
    moveTaskToList,
    createList,
  } = useTasks()

  const [selectedTaskForMove, setSelectedTaskForMove] = useState<Task | null>(null)
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null)
  const [showNewListInput, setShowNewListInput] = useState(false)
  const [newListName, setNewListName] = useState('')

  const inboxTasks = getInboxTasks()

  const handleTaskAdd = (task: ParsedTask) => {
    addTask(task)
  }

  const handleMoveTask = (taskId: string, listId: string | null) => {
    moveTaskToList(taskId, listId)
    setSelectedTaskForMove(null)
  }

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim())
      setNewListName('')
      setShowNewListInput(false)
    }
  }

  const handleDeleteTask = (id: string) => {
    deleteTask(id)
  }

  const handleToggleTask = (id: string) => {
    toggleTask(id)
  }

  const handleEditTask = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates)
    setSelectedTaskForEdit(null)
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📥 Inbox</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Capture tasks quickly and organize them into lists
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Add Section */}
        <section>
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Add Task
            </h2>
            <QuickAddInput onTaskAdd={handleTaskAdd} />
          </div>
        </section>

        {/* Lists and Inbox Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Inbox Tasks (Main Column) */}
          <div className="lg:col-span-2">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Inbox Tasks ({inboxTasks.length})
                </h2>
              </div>

              {inboxTasks.length > 0 ? (
                <div className="rounded-xl bg-white shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {inboxTasks.map((task) => (
                      <TaskInboxItem
                        key={task.id}
                        task={task}
                        onToggle={() => handleToggleTask(task.id)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onMove={() => setSelectedTaskForMove(task)}
                        onEdit={() => setSelectedTaskForEdit(task)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ✨ Your inbox is empty! Add a task to get started.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Lists Sidebar */}
          <aside>
            <section>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📋 Lists
                </h3>
              </div>

              <div className="space-y-2">
                {/* Create New List */}
                <button
                  onClick={() => setShowNewListInput(!showNewListInput)}
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#4B2FFF] hover:text-[#4B2FFF] dark:border-gray-700 dark:text-gray-300 dark:hover:border-[#4B2FFF] dark:hover:text-[#4B2FFF]"
                >
                  + New List
                </button>

                {/* New List Input */}
                {showNewListInput && (
                  <div className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateList()
                        } else if (e.key === 'Escape') {
                          setShowNewListInput(false)
                        }
                      }}
                      placeholder="List name..."
                      autoFocus
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4B2FFF] focus:outline-none focus:ring-1 focus:ring-[#4B2FFF] dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateList}
                        disabled={!newListName.trim()}
                        className="flex-1 rounded-lg bg-[#4B2FFF] px-3 py-1 text-xs font-medium text-white hover:bg-[#3a21cc] disabled:opacity-50"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowNewListInput(false)
                          setNewListName('')
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* List Items */}
                {lists.length > 0 ? (
                  <div className="space-y-2">
                    {lists.map((list) => (
                      <div
                        key={list.id}
                        className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800"
                      >
                        <div
                          className="h-2 w-full rounded-full mb-2"
                          style={{
                            backgroundColor: list.color || '#4B2FFF',
                          }}
                        />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {list.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {tasks.filter((t) => t.listId === list.id).length} tasks
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No lists yet. Create one to organize tasks.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Move to List Modal */}
      {selectedTaskForMove && (
        <MoveToListModal
          task={selectedTaskForMove}
          lists={lists}
          isOpen={true}
          onClose={() => setSelectedTaskForMove(null)}
          onMove={handleMoveTask}
          onCreateList={createList}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTaskForEdit && (
        <TaskDetailModal
          task={selectedTaskForEdit}
          isOpen={true}
          onClose={() => setSelectedTaskForEdit(null)}
          onSave={(updates) => handleEditTask(selectedTaskForEdit.id, updates)}
        />
      )}
    </div>
  )
}

/**
 * Task Inbox Item Component
 */
function TaskInboxItem({
  task,
  onToggle,
  onDelete,
  onMove,
  onEdit,
}: {
  task: Task
  onToggle?: () => void
  onDelete?: () => void
  onMove?: () => void
  onEdit?: () => void
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 transition-all ${
        task.completed
          ? 'bg-gray-50 opacity-60 dark:bg-gray-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="mt-1 flex-shrink-0"
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
          <div className="mt-2 flex flex-wrap gap-1">
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
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
          {task.priority && task.priority !== 'medium' && (
            <span>
              {task.priority === 'high' ? '🔴' : '📊'} {task.priority}
            </span>
          )}
          {task.date && <span>📅 {formatDateForDisplay(task.date)}</span>}
          {task.time && <span>🕐 {task.time}</span>}
          {task.recurrence && task.recurrence !== 'none' && (
            <span>🔄 {task.recurrence}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex gap-2">
        <button
          onClick={onMove}
          className="text-gray-400 hover:text-[#4B2FFF] dark:text-gray-500 dark:hover:text-[#4B2FFF]"
          aria-label="Move to list"
          title="Move to list"
        >
          📋
        </button>
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
