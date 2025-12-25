import React, { useState, useEffect } from 'react';
import { useHomepageContent } from '../../hooks/useHomepage';
import { homepageApi, HomepageContent } from '../../services/api-service';

const ManageHomepage: React.FC = () => {
  const { content: heroContent, loading } = useHomepageContent('hero');
  const [formData, setFormData] = useState<Partial<HomepageContent>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (heroContent) {
      setFormData(heroContent);
    }
  }, [heroContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await homepageApi.updateContent(formData);
      setMessage({ type: 'success', text: 'Homepage updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update homepage. Please try again.' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Manage Homepage Content</h1>

      {message && (
        <div 
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={2}
            placeholder="FULL STACK&#10;DEVELOPER"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Use line breaks to separate lines</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle
          </label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="text"
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="sabas.png"
          />
          {formData.imageUrl && (
            <div className="mt-2">
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary CTA Text
            </label>
            <input
              type="text"
              value={formData.ctaPrimaryText || ''}
              onChange={(e) => setFormData({ ...formData, ctaPrimaryText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="View Projects"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary CTA Link
            </label>
            <input
              type="text"
              value={formData.ctaPrimaryLink || ''}
              onChange={(e) => setFormData({ ...formData, ctaPrimaryLink: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="/projects"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary CTA Text
            </label>
            <input
              type="text"
              value={formData.ctaSecondaryText || ''}
              onChange={(e) => setFormData({ ...formData, ctaSecondaryText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Download CV"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary CTA Link
            </label>
            <input
              type="text"
              value={formData.ctaSecondaryLink || ''}
              onChange={(e) => setFormData({ ...formData, ctaSecondaryLink: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="/cv.pdf"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Preview</h2>
        <div className="bg-white p-6 rounded-lg">
          <h1 className="text-4xl font-bold mb-4">
            {formData.title?.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>
          <p className="text-gray-600 mb-4">{formData.description}</p>
          <div className="flex gap-4">
            {formData.ctaPrimaryText && (
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                {formData.ctaPrimaryText}
              </button>
            )}
            {formData.ctaSecondaryText && (
              <button className="border border-green-500 text-green-500 px-4 py-2 rounded">
                {formData.ctaSecondaryText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHomepage;
