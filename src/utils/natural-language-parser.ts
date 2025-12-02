/**
 * Natural Language Parser for Task Input
 * Parses user input to extract dates, times, and tags
 */

export interface ParsedTask {
  title: string
  date: Date | null
  time: string | null
  tags: string[]
  rawInput: string
}

// Time patterns
const TIME_PATTERNS = [
  /\b(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])\s*(am|pm|AM|PM)?\b/,
  /\b(morning|afternoon|evening|night|tonight)\b/i,
  /\b(at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)\b/i,
]

// Date patterns
const DATE_PATTERNS = [
  /\b(today)\b/i,
  /\b(tomorrow)\b/i,
  /\b(tonight)\b/i,
  /\b(next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
  /\b(mon|tue|wed|thu|fri|sat|sun)\b/i,
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/,
  /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i,
  /\b(in\s+)?(\d+)\s+(day|days|week|weeks|month|months|hour|hours|minute|minutes)\b/i,
]

// Tag patterns (starting with # or after "tag:")
const TAG_PATTERNS = [/#([a-zA-Z0-9_-]+)/g, /tag:\s*([a-zA-Z0-9_\s,]+)/gi]

const DAYS_OF_WEEK: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
}

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

/**
 * Parse date from user input
 */
function parseDate(input: string): Date | null {
  const lowerInput = input.toLowerCase()

  // Today
  if (/\btoday\b/.test(lowerInput)) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }

  // Tomorrow
  if (/\btomorrow\b/.test(lowerInput)) {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(0, 0, 0, 0)
    return date
  }

  // Next Monday, Tuesday, etc.
  const nextDayMatch = lowerInput.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i)
  if (nextDayMatch) {
    const dayName = nextDayMatch[1].toLowerCase()
    const targetDay = DAYS_OF_WEEK[dayName as keyof typeof DAYS_OF_WEEK]
    const today = new Date()
    const currentDay = today.getDay()
    let daysUntil = (targetDay - currentDay + 7) % 7
    if (daysUntil === 0) daysUntil = 7
    const date = new Date(today)
    date.setDate(date.getDate() + daysUntil)
    date.setHours(0, 0, 0, 0)
    return date
  }

  // Day of week (today or next occurrence)
  const dayMatch = lowerInput.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i)
  if (dayMatch) {
    const dayName = dayMatch[1].toLowerCase()
    const targetDay = DAYS_OF_WEEK[dayName as keyof typeof DAYS_OF_WEEK]
    const today = new Date()
    const currentDay = today.getDay()
    let daysUntil = (targetDay - currentDay + 7) % 7
    if (daysUntil < 0) daysUntil += 7
    const date = new Date(today)
    date.setDate(date.getDate() + daysUntil)
    date.setHours(0, 0, 0, 0)
    return date
  }

  // Month and day: "January 15" or "Jan 15"
  const monthDayMatch = lowerInput.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i)
  if (monthDayMatch) {
    const monthName = monthDayMatch[1].toLowerCase()
    const day = parseInt(monthDayMatch[2], 10)
    const month = MONTHS[monthName as keyof typeof MONTHS]
    const year = new Date().getFullYear()
    const date = new Date(year, month, day)
    // If the date is in the past, use next year
    if (date < new Date()) {
      date.setFullYear(year + 1)
    }
    date.setHours(0, 0, 0, 0)
    return date
  }

  // Relative dates: "in 2 days", "in 1 week", etc.
  const relativeMatch = lowerInput.match(/\bin\s+(\d+)\s+(day|days|week|weeks|month|months|hour|hours|minute|minutes)\b/i)
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10)
    const unit = relativeMatch[2].toLowerCase()
    const date = new Date()

    if (unit.startsWith('day')) {
      date.setDate(date.getDate() + amount)
    } else if (unit.startsWith('week')) {
      date.setDate(date.getDate() + amount * 7)
    } else if (unit.startsWith('month')) {
      date.setMonth(date.getMonth() + amount)
    } else if (unit.startsWith('hour')) {
      date.setHours(date.getHours() + amount)
    } else if (unit.startsWith('minute')) {
      date.setMinutes(date.getMinutes() + amount)
    }

    date.setHours(0, 0, 0, 0)
    return date
  }

  // Numeric date: MM/DD/YYYY or MM-DD-YYYY
  const numericMatch = lowerInput.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/)
  if (numericMatch) {
    const month = parseInt(numericMatch[1], 10) - 1
    const day = parseInt(numericMatch[2], 10)
    let year = parseInt(numericMatch[3], 10)
    if (year < 100) {
      year += year < 50 ? 2000 : 1900
    }
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    return date
  }

  return null
}

/**
 * Parse time from user input
 */
function parseTime(input: string): string | null {
  const lowerInput = input.toLowerCase()

  // HH:MM AM/PM
  const standardMatch = lowerInput.match(/\b(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])\s*(am|pm)?\b/i)
  if (standardMatch) {
    let hours = parseInt(standardMatch[1], 10)
    const minutes = standardMatch[2]
    const period = standardMatch[3]

    if (period) {
      if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12
      if (period.toLowerCase() === 'am' && hours === 12) hours = 0
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`
  }

  // Time words
  if (/\bmorning\b/i.test(lowerInput)) return '09:00'
  if (/\bafternoon\b/i.test(lowerInput)) return '14:00'
  if (/\bevening\b/i.test(lowerInput)) return '18:00'
  if (/\bnight\b/i.test(lowerInput)) return '21:00'
  if (/\btonight\b/i.test(lowerInput)) return '20:00'

  return null
}

/**
 * Extract tags from input (hashtags and tag: syntax)
 */
function extractTags(input: string): string[] {
  const tags: Set<string> = new Set()

  // Hashtag syntax: #tagname
  const hashtagMatches = input.match(/#([a-zA-Z0-9_-]+)/g)
  if (hashtagMatches) {
    hashtagMatches.forEach((match) => {
      const tag = match.substring(1).toLowerCase()
      if (tag) tags.add(tag)
    })
  }

  // tag: syntax: tag: tagname1, tagname2
  const tagMatch = input.match(/tag:\s*([a-zA-Z0-9_\s,]+)/gi)
  if (tagMatch) {
    tagMatch.forEach((match) => {
      const tagPart = match.replace(/tag:/i, '').trim()
      const tagList = tagPart.split(/[,;]/).map((t) => t.trim().toLowerCase())
      tagList.forEach((tag) => {
        if (tag) tags.add(tag)
      })
    })
  }

  return Array.from(tags)
}

/**
 * Clean input by removing date, time, and tag information
 */
function cleanInput(input: string, tags: string[]): string {
  let cleaned = input

  // Remove hashtags
  cleaned = cleaned.replace(/#[a-zA-Z0-9_-]+/g, '')

  // Remove tag: syntax
  cleaned = cleaned.replace(/tag:\s*[a-zA-Z0-9_\s,]+/gi, '')

  // Remove date expressions
  DATE_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '')
  })

  // Remove time expressions
  TIME_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '')
  })

  // Clean up extra spaces
  cleaned = cleaned
    .trim()
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned || 'New Task'
}

/**
 * Main parse function
 */
export function parseTaskInput(input: string): ParsedTask {
  const tags = extractTags(input)
  const date = parseDate(input)
  const time = parseTime(input)
  const title = cleanInput(input, tags)

  return {
    title,
    date,
    time,
    tags,
    rawInput: input,
  }
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  if (targetDate.getTime() === today.getTime()) {
    return 'Today'
  }
  if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Get suggestions for date parsing based on current input
 */
export function getDateSuggestions(input: string): Array<{ text: string; date: Date; icon: string }> {
  const suggestions: Array<{ text: string; date: Date; icon: string }> = []
  const lowerInput = input.toLowerCase()

  // Today
  if (/^t?o?d?a?y?$/i.test(input.trim())) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    suggestions.push({ text: 'Today', date: today, icon: '📅' })
  }

  // Tomorrow
  if (/^t?o?m?o?r?r?o?w?$/i.test(input.trim())) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    suggestions.push({ text: 'Tomorrow', date: tomorrow, icon: '📅' })
  }

  // Next week
  if (/^n?e?x?t?\.?\s?w?e?e?k?$/i.test(input.trim())) {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(0, 0, 0, 0)
    suggestions.push({ text: 'Next Week', date: nextWeek, icon: '📅' })
  }

  // Always include today and tomorrow as quick suggestions
  if (input.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (
      !suggestions.some((s) => s.date.getTime() === today.getTime())
    ) {
      suggestions.push({ text: 'Today', date: today, icon: '📅' })
    }
    if (
      !suggestions.some((s) => s.date.getTime() === tomorrow.getTime())
    ) {
      suggestions.push({ text: 'Tomorrow', date: tomorrow, icon: '📅' })
    }
  }

  return suggestions
}

/**
 * Get suggestions for time based on current input
 */
export function getTimeSuggestions(input: string): Array<{ text: string; time: string; icon: string }> {
  return [
    { text: 'Morning', time: '09:00', icon: '🌅' },
    { text: 'Afternoon', time: '14:00', icon: '🌤️' },
    { text: 'Evening', time: '18:00', icon: '🌆' },
    { text: 'Night', time: '21:00', icon: '🌙' },
  ]
}

/**
 * Get suggestions for tags based on common categories
 */
export function getCommonTags(): Array<{ text: string; icon: string }> {
  return [
    { text: 'work', icon: '💼' },
    { text: 'personal', icon: '👤' },
    { text: 'shopping', icon: '🛒' },
    { text: 'health', icon: '💪' },
    { text: 'learning', icon: '📚' },
    { text: 'bug', icon: '🐛' },
    { text: 'feature', icon: '⭐' },
    { text: 'urgent', icon: '⚡' },
  ]
}
