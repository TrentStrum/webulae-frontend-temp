import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { Project } from '@/app/types';

const mockProjects: Project[] = [
  {
    projectId: 'proj_1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    projectId: 'proj_2',
    name: 'Mobile App Development',
    description: 'New mobile application for iOS and Android',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const projectMockDataAccess: DataAccessInterface<Project> = {
  async getById(id) {
    const project = mockProjects.find(p => p.projectId === id);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  },

  async getAll() {
    return mockProjects;
  },

  async create(data) {
    const newProject = {
      projectId: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as Project;
    mockProjects.push(newProject);
    return newProject;
  },

  async update(id, data) {
    const index = mockProjects.findIndex(p => p.projectId === id);
    if (index === -1) throw new Error('Project not found');
    const updated = { ...mockProjects[index], ...data, updatedAt: new Date().toISOString() };
    mockProjects[index] = updated;
    return updated;
  },

  async delete(id) {
    const index = mockProjects.findIndex(p => p.projectId === id);
    if (index !== -1) mockProjects.splice(index, 1);
  }
}; 
