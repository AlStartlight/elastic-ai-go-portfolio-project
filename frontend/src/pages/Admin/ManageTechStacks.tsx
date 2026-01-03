import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { homepageApi, TechStack } from '../../services/api-service';

const ManageTechStacks: React.FC = () => {
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStack, setEditingStack] = useState<TechStack | null>(null);
  const [formData, setFormData] = useState<Omit<TechStack, 'id'>>({
    title: '',
    description: '',
    icon: '',
    category: 'frontend',
    displayOrder: 0,
    isActive: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTechStacks();
  }, []);

  const fetchTechStacks = async () => {
    try {
      setLoading(true);
      const data = await homepageApi.getTechStacks();
      setTechStacks(data);
    } catch (error) {
      console.error('Failed to fetch tech stacks:', error);
      setMessage({ type: 'error', text: 'Failed to load tech stacks' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      if (editingStack) {
        await homepageApi.updateTechStack(editingStack.id, formData);
        setMessage({ type: 'success', text: 'Tech stack updated successfully!' });
      } else {
        await homepageApi.createTechStack(formData);
        setMessage({ type: 'success', text: 'Tech stack created successfully!' });
      }
      
      await fetchTechStacks();
      handleCloseModal();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save tech stack. Please try again.' });
      console.error(error);
    }
  };

  const handleEdit = (stack: TechStack) => {
    setEditingStack(stack);
    setFormData({
      title: stack.title,
      description: stack.description,
      icon: stack.icon,
      category: stack.category,
      displayOrder: stack.displayOrder,
      isActive: stack.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await homepageApi.deleteTechStack(id);
      setMessage({ type: 'success', text: 'Tech stack deleted successfully!' });
      await fetchTechStacks();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete tech stack' });
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStack(null);
    setFormData({
      title: '',
      description: '',
      icon: '',
      category: 'frontend',
      displayOrder: 0,
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Tech Stacks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Tech Stack
        </button>
      </div>

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

      {/* Tech Stacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techStacks.map((stack) => (
          <div 
            key={stack.id} 
            className={`bg-white rounded-lg shadow-md p-6 border ${
              !stack.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl">{stack.icon}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(stack)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(stack.id, stack.title)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{stack.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{stack.description}</p>
            
            <div className="flex items-center justify-between text-sm">
              <span className={`px-2 py-1 rounded ${
                stack.category === 'frontend' ? 'bg-blue-100 text-blue-800' :
                stack.category === 'backend' ? 'bg-green-100 text-green-800' :
                stack.category === 'database' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {stack.category}
              </span>
              <span className="text-gray-500">Order: {stack.displayOrder}</span>
            </div>
            
            {!stack.isActive && (
              <div className="mt-3 text-sm text-red-600 font-medium">Inactive</div>
            )}
          </div>
        ))}
      </div>

      {techStacks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-gray-400 text-lg mb-4">No tech stacks yet</div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Your First Tech Stack
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingStack ? 'Edit Tech Stack' : 'Add Tech Stack'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="React.js"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="A JavaScript library for building user interfaces"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon (Emoji) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-4xl"
                  placeholder="⚛️"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Use emoji or icon character</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="database">Database</option>
                  <option value="devops">DevOps</option>
                  <option value="mobile">Mobile</option>
                  <option value="tools">Tools</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  <Save size={20} />
                  {editingStack ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTechStacks;
