import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface AboutContent {
  id: string;
  section: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  metadata: {
    skills?: string[];
    experience?: string;
    location?: string;
    email?: string;
    bio?: string;
  };
  isActive: boolean;
}

const ManageAbout: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutData, setAboutData] = useState<AboutContent>({
    id: '',
    section: 'about',
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    ctaPrimaryText: '',
    ctaPrimaryLink: '',
    ctaSecondaryText: '',
    ctaSecondaryLink: '',
    metadata: {
      skills: [],
      experience: '',
      location: '',
      email: '',
      bio: '',
    },
    isActive: true,
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/homepage/section/about`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        setAboutData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/homepage`,
        aboutData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('About section updated successfully!');
    } catch (error) {
      console.error('Failed to save about data:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setAboutData({
        ...aboutData,
        metadata: {
          ...aboutData.metadata,
          skills: [...(aboutData.metadata.skills || []), skillInput.trim()],
        },
      });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = [...(aboutData.metadata.skills || [])];
    newSkills.splice(index, 1);
    setAboutData({
      ...aboutData,
      metadata: {
        ...aboutData.metadata,
        skills: newSkills,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage About Me</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={aboutData.title}
                onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., About Me"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={aboutData.subtitle}
                onChange={(e) => setAboutData({ ...aboutData, subtitle: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., Full Stack Developer & Designer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={aboutData.description}
                onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                rows={5}
                placeholder="Write about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Profile Image URL</label>
              <input
                type="url"
                value={aboutData.imageUrl}
                onChange={(e) => setAboutData({ ...aboutData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={aboutData.metadata.email || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    metadata: { ...aboutData.metadata, email: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={aboutData.metadata.location || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    metadata: { ...aboutData.metadata, location: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., Jakarta, Indonesia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <input
                type="text"
                value={aboutData.metadata.experience || ''}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    metadata: { ...aboutData.metadata, experience: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., 5+"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">Skills</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Add a skill (e.g., React, Node.js, etc.)"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aboutData.metadata.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">Call to Action Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Button Text</label>
              <input
                type="text"
                value={aboutData.ctaPrimaryText}
                onChange={(e) => setAboutData({ ...aboutData, ctaPrimaryText: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., Download Resume"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Primary Button Link</label>
              <input
                type="text"
                value={aboutData.ctaPrimaryLink}
                onChange={(e) => setAboutData({ ...aboutData, ctaPrimaryLink: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="/path/to/resume.pdf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Secondary Button Text</label>
              <input
                type="text"
                value={aboutData.ctaSecondaryText}
                onChange={(e) =>
                  setAboutData({ ...aboutData, ctaSecondaryText: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., Contact Me"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Secondary Button Link</label>
              <input
                type="text"
                value={aboutData.ctaSecondaryLink}
                onChange={(e) =>
                  setAboutData({ ...aboutData, ctaSecondaryLink: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                placeholder="mailto:your@email.com"
              />
            </div>
          </div>
        </div>

        {/* Additional Bio */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">Extended Bio</h2>
          <textarea
            value={aboutData.metadata.bio || ''}
            onChange={(e) =>
              setAboutData({
                ...aboutData,
                metadata: { ...aboutData.metadata, bio: e.target.value },
              })
            }
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
            rows={6}
            placeholder="Write a more detailed biography..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={fetchAboutData}
            className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageAbout;
