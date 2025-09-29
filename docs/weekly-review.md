# Weekly Review Feature

The Weekly Review is a ritual that helps users review their week's progress, reflect on accomplishments, and set focus for the upcoming week.

## Page Location
`/rituals/weekly`

## Features

### Step 1: Review Open Work
- Shows tasks grouped by project that are due this week but not completed
- Quick actions for each task:
  - Mark Complete
  - Snooze (1 week)
  - Move to Backlog
  - Set High Priority
  - Delete Task

### Step 2: Wins & Reflection
- Auto-summary of completed tasks count for the week
- Text field for highlight/reflection of the week
- Saved to journal for tracking progress

### Step 3: Set Next Week's Anchors
- Select 3-5 key tasks to focus on next week
- Tasks get tagged with `weekly_focus: true`
- Tasks automatically get due dates set to next week
- Visual selection interface with task cards

### Complete Weekly Review
- Saves reflection and anchor selections to journal
- Updates selected tasks with weekly focus flag
- Logs completion for streak tracking

## Database Schema

### Tasks Table Addition
```sql
ALTER TABLE tasks ADD COLUMN weekly_focus BOOLEAN DEFAULT FALSE;
```

### Journal Table Usage
- Uses existing journal table with `type: 'weekly'`
- Stores reflection in `reflection` field
- Stores anchor task IDs in `weekly_anchors` array

## Navigation
- Added to sidebar under "Rituals" section
- Icon: CalendarViewWeek
- Path: `/rituals/weekly`

## Future Enhancements
- Streak tracking visualization
- Weekly review calendar view
- Completion statistics and trends
- Integration with daily rituals