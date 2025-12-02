/**
 * Parser Demo Component
 * Interactive demonstration of natural language parsing capabilities
 */

import { useState } from 'react'
import { parseTaskInput, formatDateForDisplay } from '@/utils/natural-language-parser'

const DEMO_INPUTS = [
  'Review report tomorrow at 2pm #work',
  'Buy groceries saturday evening #shopping',
  'Fix bug in 2 days #bug tag: urgent',
  'Team meeting next monday morning',
  'Call mom january 15',
  'today at 9:30am #urgent',
  'Write documentation #work #documentation',
  'Exercise fri afternoon #health',
]

export function ParserDemo() {
  const [selectedExample, setSelectedExample] = useState(DEMO_INPUTS[0])
  const parsed = parseTaskInput(selectedExample)

  return (
    <div className="space-y-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        🔍 Parser Demo
      </h3>

      {/* Example Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
          Example Inputs
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DEMO_INPUTS.map((input) => (
            <button
              key={input}
              onClick={() => setSelectedExample(input)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition-all ${
                selectedExample === input
                  ? 'bg-[#4B2FFF] text-white ring-2 ring-[#4B2FFF] ring-offset-2 dark:ring-offset-gray-900'
                  : 'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {input}
            </button>
          ))}
        </div>
      </div>

      {/* Input Display */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
          Raw Input
        </label>
        <div className="rounded-lg bg-white p-3 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
          "{selectedExample}"
        </div>
      </div>

      {/* Parsing Results */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Extracted Title
          </label>
          <div className="rounded-lg bg-white p-3 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            {parsed.title}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
            📅 Parsed Date
          </label>
          <div className="rounded-lg bg-white p-3 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            {parsed.date
              ? formatDateForDisplay(parsed.date)
              : 'None detected'}
          </div>
        </div>

        {/* Time */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
            🕐 Parsed Time
          </label>
          <div className="rounded-lg bg-white p-3 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            {parsed.time || 'None detected'}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
            🏷️ Parsed Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {parsed.tags.length > 0 ? (
              parsed.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                None detected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Full JSON */}
      <details className="cursor-pointer">
        <summary className="text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
          📊 Show Full Parsed Object
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg bg-white p-3 dark:bg-gray-800">
          <pre className="font-mono text-xs text-gray-900 dark:text-gray-100">
            {JSON.stringify(parsed, (key, value) => {
              if (value instanceof Date) {
                return value.toISOString()
              }
              return value
            }, 2)}
          </pre>
        </div>
      </details>
    </div>
  )
}
