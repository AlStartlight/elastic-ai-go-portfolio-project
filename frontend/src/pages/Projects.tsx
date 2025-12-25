import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useProjects } from '../hooks/useProjects';

const Projects: React.FC = () => {
  const { t } = useTranslation();
  const { projects, loading, error } = useProjects();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-xl">Loading projects...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p>Error loading projects: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Projects - Asep Jumadi | Portfolio & Case Studies"
        description="Explore my portfolio of web development projects featuring React, TypeScript, Go, and modern tech stack. Real-world applications and case studies."
        keywords="portfolio, web development projects, react projects, golang projects, case studies, web applications"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
            My <span className="text-green-500">Projects</span>
          </h1>
          
          {projects.length === 0 ? (
            <div className="text-center text-gray-300">
              <p className="text-xl">{t('no_projects') || 'No projects available at the moment.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className="bg-gray-800/50 rounded-lg shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-gray-700"
                >
                  {project.thumbnailUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      {project.featured && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>
                    <p className="text-gray-300 mb-4">
                      {project.shortDescription}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    {/* Action Links */}
                    <div className="flex gap-4 mt-6">
                      {project.projectUrl && (
                        <a 
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                        >
                          View Project
                        </a>
                      )}
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 border-2 border-gray-600 hover:border-green-500 text-gray-300 hover:text-green-500 text-center font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Projects;