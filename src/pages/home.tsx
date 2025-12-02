/**
 * Home Page
 * Showcases the quick-add task input component with task management
 */

import { useState } from 'react'
import { QuickAddInput, type QuickAddInputProps } from '@/components/quick-add-input'
import { TaskList } from '@/components/task-list'
import { ParserDemo } from '@/components/parser-demo'
import type { ParsedTask } from '@/utils/natural-language-parser'
import type { Task } from '@/hooks/use-tasks'
import { formatDateForDisplay } from '@/utils/natural-language-parser'

export function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [viewMode, setViewMode] = useState<'date' | 'tag' | 'list'>('date')
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('active')

  const handleTaskAdd = (task: ParsedTask) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      completed: false,
    }
    setTasks([newTask, ...tasks])
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task
      )
    )
  }

  const handleEditTask = (id: string, updates: Partial<typeof tasks[0]>) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NoTODO</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Fast task capture with natural language parsing
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Add Section */}
        <section>
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Add
            </h2>
            <QuickAddInput onTaskAdd={handleTaskAdd} />
          </div>
        </section>

        {/* Tasks List */}
        {tasks.length > 0 && (
          <section>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tasks ({tasks.filter((t) => !t.completed).length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {/* View Mode */}
                <div className="flex gap-1 rounded-lg bg-gray-200 p-1 dark:bg-gray-800">
                  {(
                    [
                      { mode: 'date', label: '📅 Date' },
                      { mode: 'tag', label: '🏷️ Tag' },
                      { mode: 'list', label: '📋 List' },
                    ] as const
                  ).map(({ mode, label }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-[#4B2FFF] text-white'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Filter Mode */}
                <div className="flex gap-1 rounded-lg bg-gray-200 p-1 dark:bg-gray-800">
                  {(
                    [
                      { mode: 'active', label: 'Active' },
                      { mode: 'completed', label: 'Done' },
                      { mode: 'all', label: 'All' },
                    ] as const
                  ).map(({ mode, label }) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        filterMode === mode
                          ? 'bg-[#4B2FFF] text-white'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
              <TaskList
                tasks={tasks}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
                groupBy={viewMode}
                filter={filterMode}
              />
            </div>
          </section>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">
              Start adding tasks to see them appear here
            </p>
          </div>
        )}

        {/* Features Section */}
        <section className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-6 dark:from-purple-900 dark:to-blue-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ✨ Features
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Natural Language Parsing
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Parse dates, times, and tags from natural language input
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Smart Suggestions
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Get suggestions for dates, times, and common tags
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Multiple Formats
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Support hashtags, relative dates, and time words
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Rapid Capture
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Add tasks in seconds without complex forms
              </p>
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section className="rounded-xl bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📝 Syntax Guide
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Dates
              </h4>
              <code className="mt-1 block rounded bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                today | tomorrow | next monday | January 15 | in 3 days
              </code>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Times
              </h4>
              <code className="mt-1 block rounded bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                9:30am | 2:45pm | morning | afternoon | evening
              </code>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Tags
              </h4>
              <code className="mt-1 block rounded bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                #work #urgent | tag: personal, shopping
              </code>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Combined
              </h4>
              <code className="mt-1 block rounded bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Review report tomorrow at 2pm #work #urgent
              </code>
            </div>
          </div>
        </section>

        {/* Parser Demo */}
        <section className="rounded-xl bg-white dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
          <div className="p-6">
            <ParserDemo />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 text-center text-sm text-gray-600 dark:text-gray-400 sm:px-6 lg:px-8">
          <p>Fast, offline-first task management with privacy by design</p>
        </div>
      </footer>
    </div>
  )
}
