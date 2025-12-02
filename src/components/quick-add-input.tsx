/**
 * Quick-Add Task Input Component
 * Provides rapid task capture with natural language parsing
 * Includes suggestions for dates, times, and tags
 */

import { useState, useRef, useEffect } from 'react'
import {
  parseTaskInput,
  formatDateForDisplay,
  getDateSuggestions,
  getTimeSuggestions,
  getCommonTags,
  type ParsedTask,
} from '@/utils/natural-language-parser'

export interface QuickAddInputProps {
  onTaskAdd?: (task: ParsedTask) => void
  placeholder?: string
  autoFocus?: boolean
}

export function QuickAddInput({ onTaskAdd, placeholder = 'Add a task... (try "Review report tomorrow at 2pm #work")', autoFocus = true }: QuickAddInputProps) {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedTask | null>(null)
  const [showDateSuggestions, setShowDateSuggestions] = useState(false)
  const [showTimeSuggestions, setShowTimeSuggestions] = useState(false)
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Parse input in real-time
  useEffect(() => {
    if (input.trim()) {
      const parsed = parseTaskInput(input)
      setParsed(parsed)
      setSelectedDate(parsed.date)
      setSelectedTime(parsed.time)
      setSelectedTags(parsed.tags)
    } else {
      setParsed(null)
      setSelectedDate(null)
      setSelectedTime(null)
      setSelectedTags([])
    }
  }, [input])

  // Handle focus on date section
  const handleDateSectionClick = () => {
    setShowDateSuggestions(!showDateSuggestions)
    setShowTimeSuggestions(false)
    setShowTagSuggestions(false)
  }

  // Handle date suggestion click
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowDateSuggestions(false)
  }

  // Handle time suggestion click
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setShowTimeSuggestions(false)
  }

  // Handle tag suggestion click
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
    setShowTagSuggestions(false)
  }

  // Handle tag removal
  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  // Handle task submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !parsed) return

    const task: ParsedTask = {
      title: parsed.title,
      date: selectedDate,
      time: selectedTime,
      tags: selectedTags,
      rawInput: input,
    }

    onTaskAdd?.(task)

    // Reset form
    setInput('')
    setParsed(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedTags([])

    // Refocus input
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDateSuggestions(false)
        setShowTimeSuggestions(false)
        setShowTagSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dateSuggestions = getDateSuggestions(input)
  const timeSuggestions = getTimeSuggestions(input)
  const commonTags = getCommonTags()

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-[#4B2FFF] focus:outline-none focus:ring-2 focus:ring-[#4B2FFF] focus:ring-opacity-10 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-500 dark:focus:border-[#4B2FFF]"
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput('')
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear input"
            >
              ✕
            </button>
          )}
        </div>

        {/* Parsed Task Preview and Suggestions */}
        {parsed && input.trim() && (
          <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            {/* Task Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Task Title</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{parsed.title}</p>
            </div>

            {/* Date Selector */}
            <div>
              <button
                type="button"
                onClick={handleDateSectionClick}
                className="flex items-center gap-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#4B2FFF] dark:text-gray-400 dark:hover:text-[#4B2FFF]"
              >
                <span>📅 Date</span>
                {selectedDate && <span className="ml-auto text-gray-900 dark:text-gray-100">{formatDateForDisplay(selectedDate)}</span>}
              </button>
              {showDateSuggestions && (
                <div ref={suggestionsRef} className="mt-2 space-y-2">
                  {dateSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDateSelect(suggestion.date)}
                      className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                        selectedDate?.getTime() === suggestion.date.getTime()
                          ? 'bg-[#4B2FFF] text-white'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-2">{suggestion.icon}</span>
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Selector */}
            {selectedDate && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowTimeSuggestions(!showTimeSuggestions)
                    setShowDateSuggestions(false)
                    setShowTagSuggestions(false)
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#4B2FFF] dark:text-gray-400 dark:hover:text-[#4B2FFF]"
                >
                  <span>🕐 Time</span>
                  {selectedTime && <span className="ml-auto text-gray-900 dark:text-gray-100">{selectedTime}</span>}
                </button>
                {showTimeSuggestions && (
                  <div ref={suggestionsRef} className="mt-2 grid grid-cols-2 gap-2">
                    {timeSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTimeSelect(suggestion.time)}
                        className={`rounded px-3 py-2 text-sm transition-colors ${
                          selectedTime === suggestion.time
                            ? 'bg-[#4B2FFF] text-white'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="mr-2">{suggestion.icon}</span>
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tags Selector */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowTagSuggestions(!showTagSuggestions)
                  setShowDateSuggestions(false)
                  setShowTimeSuggestions(false)
                }}
                className="flex items-center gap-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#4B2FFF] dark:text-gray-400 dark:hover:text-[#4B2FFF]"
              >
                <span>🏷️ Tags</span>
                {selectedTags.length > 0 && <span className="ml-auto rounded-full bg-[#4B2FFF] px-2 py-1 text-xs text-white">{selectedTags.length}</span>}
              </button>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-[#4B2FFF] px-3 py-1 text-xs font-medium text-white"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 hover:text-yellow-200"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tag Suggestions */}
              {showTagSuggestions && (
                <div ref={suggestionsRef} className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {commonTags.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTagSelect(tag.text)}
                      disabled={selectedTags.includes(tag.text)}
                      className={`rounded px-3 py-2 text-sm transition-colors ${
                        selectedTags.includes(tag.text)
                          ? 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-500'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-2">{tag.icon}</span>
                      {tag.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {input.trim() && (
          <button
            type="submit"
            className="w-full rounded-lg bg-[#4B2FFF] px-4 py-3 font-semibold text-white transition-all hover:bg-[#3a23cc] active:scale-95 dark:bg-[#4B2FFF] dark:hover:bg-[#6b3fff]"
          >
            <span>✓ Add Task</span>
            {selectedDate && <span className="ml-2">{formatDateForDisplay(selectedDate)}</span>}
          </button>
        )}
      </form>

      {/* Tips */}
      {!input && (
        <div className="mt-6 space-y-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">💡 Try these examples:</p>
          <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-300">
            <li>• "Review report tomorrow at 2pm #work"</li>
            <li>• "Buy groceries saturday evening #shopping"</li>
            <li>• "Fix bug in 2 days #bug tag: urgent"</li>
            <li>• "Team meeting next monday morning"</li>
          </ul>
        </div>
      )}
    </div>
  )
}
