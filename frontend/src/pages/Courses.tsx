import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, DollarSign, Search, Filter } from 'lucide-react';
import * as courseApi from '../api/courseApi';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<courseApi.Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<courseApi.CourseListParams>({
    page: 1,
    limit: 12,
    search: '',
    level: '',
    is_free: undefined,
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourses(filters);
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Online Courses</h1>
          <p className="text-xl text-blue-100 mb-8">
            Learn at your own pace with expert-led video courses
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={filters.level || ''}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={filters.is_free === undefined ? '' : filters.is_free ? 'free' : 'paid'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  is_free: e.target.value === '' ? undefined : e.target.value === 'free',
                })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Courses</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>

            {(filters.level || filters.is_free !== undefined || filters.search) && (
              <button
                onClick={() => setFilters({ page: 1, limit: 12, search: '', level: '' })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-200">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen size={48} className="text-gray-400" />
                    </div>
                  )}
                  <span
                    className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      course.level === 'beginner'
                        ? 'bg-green-500 text-white'
                        : course.level === 'intermediate'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {course.level}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen size={16} />
                      {course.total_lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {formatDuration(course.total_duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-lg font-bold text-gray-900">
                      {course.is_free ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <DollarSign size={20} />
                          {course.price}
                        </span>
                      )}
                    </span>
                    <span className="text-blue-600 font-medium group-hover:underline">
                      View Course →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
