/**
 * Move to List Modal Component
 * Allows users to move a task to a different list
 */

import { useState } from 'react'
import type { Task, TaskList } from '@/hooks/use-tasks'

export interface MoveToListModalProps {
  task: Task
  lists: TaskList[]
  isOpen: boolean
  onClose: () => void
  onMove: (taskId: string, listId: string | null) => void
  onCreateList?: (name: string, color?: string) => TaskList
}

export function MoveToListModal({
  task,
  lists,
  isOpen,
  onClose,
  onMove,
  onCreateList,
}: MoveToListModalProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [showNewListInput, setShowNewListInput] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListColor, setNewListColor] = useState('#4B2FFF')

  const handleMove = () => {
    onMove(task.id, selectedListId)
  }

  const handleCreateNewList = () => {
    if (newListName.trim() && onCreateList) {
      onCreateList(newListName.trim(), newListColor)
      setNewListName('')
      setNewListColor('#4B2FFF')
      setShowNewListInput(false)
    }
  }

  const colors = ['#4B2FFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

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
                Move Task to List
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
              {/* Task Info */}
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Task
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {task.title}
                </p>
              </div>

              {/* Inbox Option */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Move to:
                </p>
                <button
                  onClick={() => setSelectedListId(null)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                    selectedListId === null
                      ? 'border-[#4B2FFF] bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📥</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Inbox
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Back to unsorted tasks
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Lists */}
              {lists.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Or select a list:
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                          selectedListId === list.id
                            ? 'border-[#4B2FFF] bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{
                              backgroundColor: list.color || '#4B2FFF',
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {list.name}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New List Option */}
              <button
                onClick={() => setShowNewListInput(!showNewListInput)}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-[#4B2FFF] hover:text-[#4B2FFF] dark:border-gray-700 dark:text-gray-300 dark:hover:border-[#4B2FFF] dark:hover:text-[#4B2FFF]"
              >
                + Create New List
              </button>

              {/* New List Creation Form */}
              {showNewListInput && (
                <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      List Name
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Enter list name..."
                      autoFocus
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4B2FFF] focus:outline-none focus:ring-1 focus:ring-[#4B2FFF] dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Color
                    </label>
                    <div className="mt-2 flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewListColor(color)}
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            newListColor === color
                              ? 'border-gray-900 dark:border-white'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateNewList}
                      disabled={!newListName.trim()}
                      className="flex-1 rounded-lg bg-[#4B2FFF] px-3 py-2 text-sm font-medium text-white hover:bg-[#3a21cc] disabled:opacity-50"
                    >
                      Create & Select
                    </button>
                    <button
                      onClick={() => {
                        setShowNewListInput(false)
                        setNewListName('')
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
                onClick={handleMove}
                className="flex-1 rounded-lg bg-[#4B2FFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a21cc]"
              >
                Move Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
