import { Task, Project } from '@/types'

interface ParsedTaskData {
  title: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
  project_id?: string
  description?: string
  is_feature?: boolean
}

interface ParseResult {
  parsed: ParsedTaskData
  confidence: number
  suggestions?: string[]
}

// Symbol-based parsing patterns
const SYMBOLS = {
  date: '#',      // #tomorrow, #monday, #2024-01-15
  priority: '!',  // !high, !medium, !low
  project: '$',   // $projectname
  feature: '%'    // %Feat
}

// Priority levels
const PRIORITY_LEVELS = ['low', 'medium', 'high']

// Date patterns
const DATE_KEYWORDS = {
  today: ['today', 'now'],
  tomorrow: ['tomorrow', 'tmr'],
  thisWeek: ['thisweek', 'week'],
  nextWeek: ['nextweek'],
  monday: ['monday', 'mon'],
  tuesday: ['tuesday', 'tue', 'tues'],
  wednesday: ['wednesday', 'wed'],
  thursday: ['thursday', 'thu', 'thur'],
  friday: ['friday', 'fri'],
  saturday: ['saturday', 'sat'],
  sunday: ['sunday', 'sun']
}

export class NaturalLanguageTaskParser {
  private projects: Project[]

  constructor(projects: Project[] = []) {
    this.projects = projects
  }

  public parse(input: string): ParseResult {
    const cleanInput = input.trim()
    
    if (!cleanInput) {
      return {
        parsed: { title: '' },
        confidence: 0
      }
    }

    let workingText = cleanInput
    const parsed: ParsedTaskData = { title: '' }
    let confidence = 0.8 // Base confidence

    // Extract date (# symbol)
    const dateResult = this.extractWithSymbol(workingText, SYMBOLS.date)
    if (dateResult.extracted) {
      const dueDate = this.parseDateString(dateResult.extracted)
      if (dueDate) {
        parsed.due_date = dueDate
        workingText = dateResult.remainingText
        confidence += 0.1
      }
    }

    // Extract priority (! symbol)
    const priorityResult = this.extractWithSymbol(workingText, SYMBOLS.priority)
    if (priorityResult.extracted) {
      const priority = this.parsePriorityString(priorityResult.extracted)
      if (priority) {
        parsed.priority = priority
        workingText = priorityResult.remainingText
        confidence += 0.1
      }
    }

    // Extract project ($ symbol)
    const projectResult = this.extractWithSymbol(workingText, SYMBOLS.project)
    if (projectResult.extracted) {
      const projectId = this.findProjectByName(projectResult.extracted)
      if (projectId) {
        parsed.project_id = projectId
        workingText = projectResult.remainingText
        confidence += 0.1
      }
    }

    // Extract feature (% symbol)
    const featureResult = this.extractWithSymbol(workingText, SYMBOLS.feature)
    if (featureResult.extracted) {
      const featureValue = this.parseFeatureString(featureResult.extracted)
      if (featureValue) {
        parsed.is_feature = featureValue
        workingText = featureResult.remainingText
        confidence += 0.1
      }
    }

    // Remaining text becomes the title
    parsed.title = workingText.trim() || cleanInput

    return {
      parsed,
      confidence: Math.min(confidence, 1.0),
      suggestions: this.generateSuggestions()
    }
  }

  private extractWithSymbol(text: string, symbol: string): { extracted?: string, remainingText: string } {
    const regex = new RegExp(`\\${symbol}([^\\s\\${SYMBOLS.date}\\${SYMBOLS.priority}\\${SYMBOLS.project}\\${SYMBOLS.feature}]+)`, 'gi')
    const match = regex.exec(text)
    
    if (match) {
      return {
        extracted: match[1].trim(),
        remainingText: text.replace(match[0], '').trim()
      }
    }
    
    return { remainingText: text }
  }

  private parseDateString(dateStr: string): string | null {
    const lowerDateStr = dateStr.toLowerCase()
    
    // Check for today/tomorrow
    if (DATE_KEYWORDS.today.includes(lowerDateStr)) {
      return new Date().toISOString().split('T')[0]
    }
    
    if (DATE_KEYWORDS.tomorrow.includes(lowerDateStr)) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    }

    // Check for this week/next week
    if (DATE_KEYWORDS.thisWeek.includes(lowerDateStr)) {
      const friday = this.getNextFriday()
      return friday.toISOString().split('T')[0]
    }

    if (DATE_KEYWORDS.nextWeek.includes(lowerDateStr)) {
      const nextFriday = this.getNextFriday()
      nextFriday.setDate(nextFriday.getDate() + 7)
      return nextFriday.toISOString().split('T')[0]
    }

    // Check for specific days of week
    for (const [day, keywords] of Object.entries(DATE_KEYWORDS)) {
      if (keywords.includes(lowerDateStr) && day !== 'today' && day !== 'tomorrow' && day !== 'thisWeek' && day !== 'nextWeek') {
        const targetDate = this.getNextDayOfWeek(day)
        return targetDate.toISOString().split('T')[0]
      }
    }

    // Check for specific date formats (YYYY-MM-DD, MM-DD-YYYY, MM/DD, etc.)
    const datePatterns = [
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})$/, // MM/DD (current year)
      /^(\d{1,2})-(\d{1,2})$/ // MM-DD (current year)
    ]

    for (const pattern of datePatterns) {
      const match = dateStr.match(pattern)
      if (match) {
        try {
          let year: number, month: number, day: number
          
          if (pattern.source.includes('\\d{4}')) {
            // Full year provided
            if (pattern.source.startsWith('^\\(\\\\d\\{4\\}')) {
              // YYYY-MM-DD
              [, year, month, day] = match.map(Number)
            } else {
              // MM-DD-YYYY or MM/DD/YYYY
              [, month, day, year] = match.map(Number)
            }
          } else {
            // Current year
            [, month, day] = match.map(Number)
            year = new Date().getFullYear()
          }
          
          const date = new Date(year, month - 1, day)
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]
          }
        } catch (e) {
          // Invalid date, continue
        }
      }
    }

    return null
  }

  private parsePriorityString(priorityStr: string): 'low' | 'medium' | 'high' | null {
    const lowerPriority = priorityStr.toLowerCase()
    
    // Direct matches
    if (PRIORITY_LEVELS.includes(lowerPriority)) {
      return lowerPriority as 'low' | 'medium' | 'high'
    }
    
    // Aliases
    const priorityAliases = {
      high: ['urgent', 'important', 'critical', 'asap', '1', '3'],
      medium: ['normal', 'moderate', '2'],
      low: ['minor', 'someday', 'maybe', '0']
    }
    
    for (const [level, aliases] of Object.entries(priorityAliases)) {
      if (aliases.includes(lowerPriority)) {
        return level as 'low' | 'medium' | 'high'
      }
    }
    
    return null
  }

  private parseFeatureString(featureStr: string): boolean | null {
    const lowerFeature = featureStr.toLowerCase()
    
    // Check if it's a feature tag
    if (lowerFeature === 'feat' || lowerFeature === 'feature') {
      return true
    }
    
    return null
  }

  private findProjectByName(projectName: string): string | null {
    const lowerProjectName = projectName.toLowerCase()
    
    // Exact match first
    const exactMatch = this.projects.find(p => 
      p.name.toLowerCase() === lowerProjectName
    )
    if (exactMatch) return exactMatch.id
    
    // Partial match
    const partialMatch = this.projects.find(p => 
      p.name.toLowerCase().includes(lowerProjectName) ||
      lowerProjectName.includes(p.name.toLowerCase())
    )
    if (partialMatch) return partialMatch.id
    
    return null
  }

  private getNextFriday(): Date {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
    const friday = new Date(today)
    friday.setDate(today.getDate() + daysUntilFriday)
    return friday
  }

  private getNextDayOfWeek(dayName: string): Date {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = days.indexOf(dayName.toLowerCase())
    if (targetDay === -1) return new Date()

    const today = new Date()
    const currentDay = today.getDay()
    const daysUntil = (targetDay - currentDay + 7) % 7 || 7
    
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysUntil)
    return targetDate
  }

  private generateSuggestions(): string[] {
    const suggestions = [
      'Use #tomorrow, #monday, or #2024-01-15 for due dates',
      'Use !high, !medium, or !low for priority',
      'Use $projectname to assign to a project',
      'Use %Feat to mark as a feature'
    ]
    
    if (this.projects.length > 0) {
      suggestions.push(`Available projects: ${this.projects.slice(0, 3).map(p => `$${p.name}`).join(', ')}`)
    }
    
    return suggestions
  }
}

export default NaturalLanguageTaskParser