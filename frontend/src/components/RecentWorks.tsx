import React, { useState, useEffect } from 'react';
import { projectsApi, Project } from '../services/api-service';

// Helper function to ensure URL has http:// or https:// protocol
const ensureHttpProtocol = (url: string | undefined): string => {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  return `https://${trimmedUrl}`;
};

interface RecentWorksProps {
  limit?: number;
}

const RecentWorks: React.FC<RecentWorksProps> = ({ limit = 6 }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsApi.getRecent(limit);
        setProjects(data);
        setError(null);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [limit]);

  // Get unique categories from projects
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  // Filter projects by category
  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Mobile': 'bg-blue-500/20 text-blue-300',
      'Website': 'bg-green-500/20 text-green-300',
      'Games': 'bg-purple-500/20 text-purple-300',
      'Web App': 'bg-cyan-500/20 text-cyan-300',
      'API': 'bg-yellow-500/20 text-yellow-300',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300';
  };

  if (loading) {
    return (
      <section className="mt-32 relative">
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              My recent <span className="text-green-500">works</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mb-8"></div>
          </div>
          <div className="text-center text-gray-400">Loading projects...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-32 relative">
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              My recent <span className="text-green-500">works</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mb-8"></div>
          </div>
          <div className="text-center text-red-400">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-20 sm:mt-24 lg:mt-32 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-repeat bg-center" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            My recent <span className="text-green-500">works</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mb-8"></div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12 px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base min-h-[44px] flex items-center justify-center ${
                  selectedCategory === category
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-gray-800/40 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:shadow-green-500/10"
            >
              <div className="relative overflow-hidden">
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-gray-600 to-gray-800 aspect-video flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {project.projectUrl && (
                      <a
                        href={ensureHttpProtocol(project.projectUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm min-h-[40px] flex items-center justify-center flex-1"
                      >
                        View Live
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={ensureHttpProtocol(project.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm min-h-[40px] flex items-center justify-center flex-1"
                      >
                        Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{project.title}</h3>
                  {project.featured && (
                    <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  {project.shortDescription || project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(project.category)}`}
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No projects found in this category.
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentWorks;
