// Sample data seeder for Nucleus
// This file helps new users get started with sample projects

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const SAMPLE_PROJECTS = [
  {
    name: 'Website Redesign',
    description: 'Modernize the company website with better UX',
    color: '#2196F3' // Blue
  },
  {
    name: 'Mobile App',
    description: 'Develop native mobile application',
    color: '#4CAF50' // Green
  },
  {
    name: 'Marketing Campaign',
    description: 'Q4 product launch marketing initiative',
    color: '#FF9800' // Orange
  },
  {
    name: 'Database Migration',
    description: 'Migrate legacy database to new infrastructure',
    color: '#9C27B0' // Purple
  },
  {
    name: 'Team Training',
    description: 'Upskill team on new technologies',
    color: '#009688' // Teal
  }
]

export async function seedSampleProjects(userId: string) {
  try {
    console.log('Seeding sample projects for user:', userId)
    
    const { data, error } = await supabase
      .from('projects')
      .insert(
        SAMPLE_PROJECTS.map(project => ({
          ...project,
          user_id: userId,
          is_archived: false
        }))
      )
      .select()

    if (error) {
      console.error('Error seeding projects:', error)
      return { success: false, error }
    }

    console.log('Successfully seeded projects:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error seeding projects:', error)
    return { success: false, error }
  }
}

export async function createProject(userId: string, projectData: {
  name: string
  description?: string
  color?: string
}) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: userId,
        is_archived: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error creating project:', error)
    return { success: false, error }
  }
}

// Helper function to check if user has any projects
export async function userHasProjects(userId: string) {
  try {
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_archived', false)

    if (error) {
      console.error('Error checking user projects:', error)
      return false
    }

    return (count || 0) > 0
  } catch (error) {
    console.error('Unexpected error checking user projects:', error)
    return false
  }
}