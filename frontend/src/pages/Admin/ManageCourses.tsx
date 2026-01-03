import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, BookOpen, Video, DollarSign } from 'lucide-react';
import * as courseApi from '../../api/courseApi';
import ImageGallery from '../../components/admin/ImageGallery';

const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<courseApi.Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<courseApi.Course | null>(null);
  const [formData, setFormData] = useState<courseApi.CreateCourseRequest>({
    title: '',
    description: '',
    thumbnail: '',
    price: 0,
    is_free: true,
    level: 'beginner',
    status: 'draft',
  });
  const [uploading, setUploading] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAllCourses({ page: 1, limit: 100 });
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course?: courseApi.Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        price: course.price,
        is_free: course.is_free,
        level: course.level,
        status: course.status,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        price: 0,
        is_free: true,
        level: 'beginner',
        status: 'draft',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate thumbnail is selected
    if (!formData.thumbnail || formData.thumbnail.trim() === '') {
      alert('Please select a thumbnail image from the gallery');
      return;
    }

    try {
      setUploading(true);

      // Thumbnail URL already set from gallery selection or upload
      const courseData = { ...formData };

      console.log('Creating course with data:', courseData);

      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, courseData);
      } else {
        const result = await courseApi.createCourse(courseData);
        console.log('Course created successfully:', result);
      }

      await fetchCourses();
      handleCloseModal();
      alert('Course saved successfully!');
    } catch (error: any) {
      console.error('Failed to save course:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save course. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseApi.deleteCourse(id);
        await fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course.');
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-600 mt-1">Create and manage your online courses</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Course
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative h-48 bg-gray-200">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen size={48} className="text-gray-400" />
                </div>
              )}
              <span
                className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  course.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {course.status}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                {course.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <BookOpen size={16} />
                  {course.total_lessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Video size={16} />
                  {formatDuration(course.total_duration)}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    course.level === 'beginner'
                      ? 'bg-green-100 text-green-800'
                      : course.level === 'intermediate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {course.level}
                </span>

                <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                  {course.is_free ? (
                    'Free'
                  ) : (
                    <>
                      <DollarSign size={16} />
                      {course.price}
                    </>
                  )}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => (window.location.href = `/admin/courses/${course.id}/builder`)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 text-sm"
                  title="Build Curriculum"
                >
                  <Eye size={16} />
                  Builder
                </button>
                <button
                  onClick={() => handleOpenModal(course)}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">Create your first course to get started</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Course
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title*
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image*
                  </label>
                  <ImageGallery
                    onSelectImage={(url) => setFormData({ ...formData, thumbnail: url })}
                    selectedImage={formData.thumbnail}
                  />
                  {formData.thumbnail && (
                    <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                      ✓ Thumbnail dipilih
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnail: '' })}
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_free}
                      onChange={(e) =>
                        setFormData({ ...formData, is_free: e.target.checked, price: 0 })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Free Course</span>
                  </label>
                </div>

                {!formData.is_free && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (USD)*
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setFormData({ ...formData, price: isNaN(value) ? 0 : value });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required={!formData.is_free}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
