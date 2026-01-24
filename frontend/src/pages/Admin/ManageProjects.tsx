import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../../hooks/useProjects';
import { projectsApi, Project, CreateProjectRequest } from '../../services/api-service';
import ImageGallery from '../../components/admin/ImageGallery';

const ManageProjects: React.FC = () => {
  const { t } = useTranslation();
  const { projects, loading, refetch } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setCurrentProject({
      title: '',
      description: '',
      shortDescription: '',
      thumbnailUrl: '',
      technologies: [],
      category: '',
      featured: false,
      status: 'published',
    });
    setIsEditing(true);
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (currentProject.id) {
        await projectsApi.update(currentProject.id, currentProject);
      } else {
        await projectsApi.create(currentProject as CreateProjectRequest);
      }
      setIsEditing(false);
      refetch();
    } catch (error) {
      alert('Failed to save project');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsApi.delete(id);
        refetch();
      } catch (error) {
        alert('Failed to delete project');
      }
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">
          {currentProject.id ? 'Edit Project' : 'Create Project'}
        </h1>
        
        <form 
          className="space-y-6 bg-white shadow-md rounded-lg p-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentProject.title || ''}
              onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentProject.shortDescription || ''}
              onChange={(e) => setCurrentProject({ ...currentProject, shortDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              maxLength={500}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={currentProject.description || ''}
              onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image <span className="text-red-500">*</span>
            </label>
            <ImageGallery
              onSelectImage={(url) => setCurrentProject({ ...currentProject, thumbnailUrl: url })}
              selectedImage={currentProject.thumbnailUrl || ''}
            />
            {currentProject.thumbnailUrl && (
              <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                ✓ Thumbnail selected
                <button
                  type="button"
                  onClick={() => setCurrentProject({ ...currentProject, thumbnailUrl: '' })}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project URL
              </label>
              <input
                type="text"
                value={currentProject.projectUrl || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, projectUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub URL
              </label>
              <input
                type="text"
                value={currentProject.githubUrl || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, githubUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technologies (comma separated) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentProject.technologies?.join(', ') || ''}
              onChange={(e) => setCurrentProject({ 
                ...currentProject, 
                technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="React, TypeScript, Go, PostgreSQL"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={currentProject.category || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={currentProject.status || 'published'}
                onChange={(e) => setCurrentProject({ ...currentProject, status: e.target.value as 'draft' | 'published' | 'archived' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={currentProject.featured || false}
                onChange={(e) => setCurrentProject({ ...currentProject, featured: e.target.checked })}
                className="mr-2 w-4 h-4 text-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured Project</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Project'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('manage_projects') || 'Manage Projects'}</h1>
        <button 
          onClick={handleCreate}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Create Project
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : !projects || projects.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">{t('no_projects') || 'No projects yet.'}</p>
          <p className="text-gray-400">Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {Array.isArray(projects) && projects.map((project) => (
            <div key={project.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                {/* Thumbnail */}
                {project.thumbnailUrl && (
                  <div className="w-48 h-48 flex-shrink-0">
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{project.title}</h3>
                    {project.featured && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'published' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{project.shortDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-800 font-medium px-3 py-1 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProjects;