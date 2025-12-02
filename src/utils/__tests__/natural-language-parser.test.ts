/**
 * Natural Language Parser Tests
 * Demonstrates the parsing capabilities
 */

import { parseTaskInput, formatDateForDisplay } from '@/utils/natural-language-parser'

// Helper to create a date at midnight
function createDate(year: number, month: number, day: number): Date {
  const date = new Date(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date
}

// Test cases showcasing the parser capabilities
export const testCases = [
  {
    input: 'Review report tomorrow at 2pm #work',
    expected: {
      titleContains: 'Review report',
      hasDate: true,
      hasTime: true,
      hasTags: true,
      tags: ['work'],
    },
  },
  {
    input: 'Buy groceries saturday evening #shopping #personal',
    expected: {
      titleContains: 'Buy groceries',
      hasDate: true,
      hasTime: true,
      hasTags: true,
      tags: ['shopping', 'personal'],
    },
  },
  {
    input: 'Fix bug in 2 days #bug tag: urgent, critical',
    expected: {
      titleContains: 'Fix bug',
      hasDate: true,
      hasTime: false,
      hasTags: true,
      tags: ['bug', 'urgent', 'critical'],
    },
  },
  {
    input: 'Team meeting next monday morning',
    expected: {
      titleContains: 'Team meeting',
      hasDate: true,
      hasTime: true,
      hasTags: false,
    },
  },
  {
    input: 'today at 9:30am #urgent',
    expected: {
      titleContains: 'New Task', // No title after parsing
      hasDate: true,
      hasTime: true,
      hasTags: true,
      tags: ['urgent'],
    },
  },
  {
    input: 'Call mom january 15',
    expected: {
      titleContains: 'Call mom',
      hasDate: true,
      hasTime: false,
      hasTags: false,
    },
  },
  {
    input: 'Write report due next friday #work #urgent',
    expected: {
      titleContains: 'Write report due',
      hasDate: true,
      hasTime: false,
      hasTags: true,
      tags: ['work', 'urgent'],
    },
  },
]

// Run tests
export function runTests(): void {
  console.log('🧪 Running Natural Language Parser Tests\n')

  testCases.forEach((testCase, index) => {
    const result = parseTaskInput(testCase.input)

    console.log(`Test ${index + 1}: "${testCase.input}"`)
    console.log(`  Title: "${result.title}"`)
    console.log(`  Date: ${result.date ? formatDateForDisplay(result.date) : 'None'}`)
    console.log(`  Time: ${result.time || 'None'}`)
    console.log(`  Tags: ${result.tags.length > 0 ? result.tags.join(', ') : 'None'}`)

    // Validate
    const titleMatch = result.title.includes(testCase.expected.titleContains)
    const dateMatch = (result.date !== null) === testCase.expected.hasDate
    const timeMatch = (result.time !== null) === testCase.expected.hasTime
    const tagsMatch = (result.tags.length > 0) === testCase.expected.hasTags

    const passed = titleMatch && dateMatch && timeMatch && tagsMatch
    console.log(`  Result: ${passed ? '✅ PASS' : '❌ FAIL'}`)

    if (!passed) {
      if (!titleMatch) console.log(`    - Title mismatch: expected to contain "${testCase.expected.titleContains}"`)
      if (!dateMatch) console.log(`    - Date mismatch: expected date=${testCase.expected.hasDate}, got=${result.date !== null}`)
      if (!timeMatch) console.log(`    - Time mismatch: expected time=${testCase.expected.hasTime}, got=${result.time !== null}`)
      if (!tagsMatch) console.log(`    - Tags mismatch: expected tags=${testCase.expected.hasTags}, got=${result.tags.length > 0}`)
    }

    console.log()
  })
}

// Export for use in console
if (typeof window !== 'undefined') {
  ;(window as any).runParserTests = runTests
}
