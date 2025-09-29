-- Add weekly_focus field to tasks table for Weekly Review functionality

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS weekly_focus BOOLEAN DEFAULT FALSE;

-- Create index for weekly_focus for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_weekly_focus ON tasks(weekly_focus) WHERE weekly_focus = TRUE;

-- Update schema comment
COMMENT ON COLUMN tasks.weekly_focus IS 'Indicates if this task is selected as a weekly focus/anchor task';