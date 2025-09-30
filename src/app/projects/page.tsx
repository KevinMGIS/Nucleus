'use client'

import { useEffect, useState } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Input, 
  Select,
  Option,
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/joy'
import { 
  Add, 
  FolderOpen, 
  Edit, 
  Delete, 
  Palette,
  Save,
  Cancel
} from '@mui/icons-material'
import { useTaskStore } from '@/stores/taskStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Project } from '@/types'
import { seedSampleProjects } from '@/utils/sampleData'
import { getUserId } from '@/lib/supabase'

const PROJECT_COLORS = [
  { name: 'Blue', value: '#2196F3' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Red', value: '#F44336' },
  { name: 'Teal', value: '#009688' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Indigo', value: '#3F51B5' }
]

interface ProjectFormData {
  name: string
  description: string
  color: string
}

export default function ProjectsPage() {
  const {
    projects,
    tasks,
    loading,
    error,
    fetchProjects,
    fetchTasks,
    addProject,
    updateProject,
    deleteProject,
  } = useTaskStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    color: PROJECT_COLORS[0].value
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSeedingProjects, setIsSeedingProjects] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchTasks()
  }, [fetchProjects, fetchTasks])

  const handleCreateProject = async () => {
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      await addProject({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        is_archived: false
      })
      
      // Reset form and close modal
      setFormData({ name: '', description: '', color: PROJECT_COLORS[0].value })
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProject = async () => {
    if (!editingProject || !formData.name.trim()) return

    setIsSubmitting(true)
    try {
      await updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color
      })
      
      setEditingProject(null)
      setFormData({ name: '', description: '', color: PROJECT_COLORS[0].value })
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      await deleteProject(projectId)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleSeedSampleProjects = async () => {
    setIsSeedingProjects(true)
    try {
      const userId = await getUserId()
      if (!userId) {
        console.error('No user ID found')
        return
      }

      const result = await seedSampleProjects(userId)
      if (result.success) {
        // Refresh projects list
        await fetchProjects()
      } else {
        console.error('Failed to seed projects:', result.error)
      }
    } catch (error) {
      console.error('Error seeding sample projects:', error)
    } finally {
      setIsSeedingProjects(false)
    }
  }

  const openCreateModal = () => {
    setFormData({ name: '', description: '', color: PROJECT_COLORS[0].value })
    setIsCreateModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || PROJECT_COLORS[0].value
    })
    setEditingProject(project)
  }

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setEditingProject(null)
    setFormData({ name: '', description: '', color: PROJECT_COLORS[0].value })
  }

  const getTaskCount = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId && task.status !== 'completed').length
  }

  if (loading && projects.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Header */}
          <Box mb={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FolderOpen sx={{ color: 'primary.500', fontSize: '2rem' }} />
                <Typography level="h1" component="h1" sx={{ color: 'neutral.800' }}>
                  Projects
                </Typography>
                <Chip size="lg" color="primary" variant="soft">
                  {projects.length}
                </Chip>
              </Box>
              <Button
                startDecorator={<Add />}
                onClick={openCreateModal}
                size="lg"
              >
                New Project
              </Button>
            </Box>
            <Typography level="body-lg" color="neutral">
              Organize your tasks into projects for better management
            </Typography>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert color="danger" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <FolderOpen sx={{ fontSize: '4rem', color: 'neutral.300', mb: 2 }} />
                <Typography level="h3" sx={{ mb: 1 }}>
                  No Projects Yet
                </Typography>
                <Typography level="body-lg" color="neutral" sx={{ mb: 3 }}>
                  Create your first project to start organizing your tasks
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    startDecorator={<Add />}
                    onClick={openCreateModal}
                    size="lg"
                  >
                    Create Project
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSeedSampleProjects}
                    loading={isSeedingProjects}
                    disabled={isSeedingProjects}
                    size="lg"
                  >
                    Quick Start (5 Sample Projects)
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 3
              }}
            >
              {projects.map((project) => (
                <Card
                  key={project.id}
                  variant="outlined"
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }
                  }}
                >
                  <CardContent>
                    {/* Project Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: project.color || '#2196F3'
                          }}
                        />
                        <Typography level="h4" fontWeight="bold">
                          {project.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="sm"
                          variant="soft"
                          onClick={() => openEditModal(project)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="soft"
                          color="danger"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Project Description */}
                    {project.description && (
                      <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
                        {project.description}
                      </Typography>
                    )}

                    {/* Project Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip size="sm" variant="soft" color="primary">
                        {getTaskCount(project.id)} active tasks
                      </Chip>
                      <Typography level="body-xs" color="neutral">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Create/Edit Project Modal */}
          <Modal
            open={isCreateModalOpen || editingProject !== null}
            onClose={closeModals}
          >
            <ModalDialog sx={{ width: 400 }}>
              <ModalClose />
              <Typography level="h4" sx={{ mb: 2 }}>
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    Project Name *
                  </Typography>
                  <Input
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                  />
                </Box>

                <Box>
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Input
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Box>

                <Box>
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    Color
                  </Typography>
                  <Select
                    value={formData.color}
                    onChange={(_, value) => setFormData({ ...formData, color: value || PROJECT_COLORS[0].value })}
                    startDecorator={<Palette />}
                  >
                    {PROJECT_COLORS.map((color) => (
                      <Option key={color.value} value={color.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: color.value
                            }}
                          />
                          {color.name}
                        </Box>
                      </Option>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={closeModals}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    startDecorator={<Save />}
                    onClick={editingProject ? handleEditProject : handleCreateProject}
                    loading={isSubmitting}
                    disabled={!formData.name.trim()}
                  >
                    {editingProject ? 'Save Changes' : 'Create Project'}
                  </Button>
                </Box>
              </Stack>
            </ModalDialog>
          </Modal>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  )
}