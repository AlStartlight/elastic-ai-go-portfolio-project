import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Clock, BarChart, CheckCircle, Lock, Play, ChevronDown, ChevronUp } from 'lucide-react';
import * as courseApi from '../api/courseApi';

const CourseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<courseApi.Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<courseApi.Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseData = await courseApi.getCourseBySlug(slug!);
      setCourse(courseData);
      setIsEnrolled(courseData.is_enrolled);

      // Auto-select first available lesson
      if (courseData.sections && courseData.sections.length > 0) {
        const firstSection = courseData.sections[0];
        if (firstSection.lessons && firstSection.lessons.length > 0) {
          setSelectedLesson(firstSection.lessons[0]);
          setExpandedSections(new Set([firstSection.id]));
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to enroll in this course');
      return;
    }

    try {
      await courseApi.enrollCourse(course.id);
      setIsEnrolled(true);
      await fetchCourse(); // Refresh to show all lessons
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in course. Please try again.');
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson || !isEnrolled) return;

    try {
      await courseApi.markLessonComplete(selectedLesson.id);
      alert('Lesson marked as complete!');
      await fetchCourse();
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const canAccessLesson = (lesson: courseApi.Lesson) => {
    return isEnrolled || course?.is_free || lesson.is_preview;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Video Player Section */}
      <div className="flex-1 flex flex-col">
        {/* Video */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {selectedLesson && canAccessLesson(selectedLesson) ? (
            selectedLesson.video_url ? (
              <video
                src={selectedLesson.video_url}
                controls
                className="w-full h-full"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center text-white">
                <Play size={64} className="mx-auto mb-4 opacity-50" />
                <p>No video available for this lesson</p>
              </div>
            )
          ) : (
            <div className="text-center text-white">
              <Lock size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-4">This lesson is locked</p>
              <button
                onClick={handleEnroll}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Enroll to Access
              </button>
            </div>
          )}
        </div>

        {/* Lesson Info */}
        <div className="bg-white p-6 border-t">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedLesson?.title || course.title}
            </h2>
            <p className="text-gray-600 mb-4">{selectedLesson?.description}</p>

            {selectedLesson?.content && (
              <div className="prose max-w-none mb-4">
                <p className="text-gray-700">{selectedLesson.content}</p>
              </div>
            )}

            {isEnrolled && selectedLesson && (
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <CheckCircle size={20} />
                Mark as Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-96 bg-white border-l flex flex-col">
        {/* Course Header */}
        <div className="p-6 border-b">
          <h3 className="font-bold text-xl text-gray-900 mb-2">{course.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BookOpen size={16} />
              {course.total_lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {formatDuration(course.total_duration)}
            </span>
          </div>

          {!isEnrolled && !course.is_free && (
            <button
              onClick={handleEnroll}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Enroll Now - ${course.price}
            </button>
          )}
        </div>

        {/* Sections and Lessons */}
        <div className="flex-1 overflow-y-auto">
          {course.sections?.map((section, sectionIndex) => (
            <div key={section.id} className="border-b">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">
                    Section {sectionIndex + 1}: {section.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.lessons?.length || 0} lessons
                  </p>
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </button>

              {/* Lessons */}
              {expandedSections.has(section.id) && (
                <div className="bg-gray-50">
                  {section.lessons?.map((lesson, lessonIndex) => (
                    <button
                      key={lesson.id}
                      onClick={() => canAccessLesson(lesson) && setSelectedLesson(lesson)}
                      disabled={!canAccessLesson(lesson)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-100 border-t border-gray-200 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedLesson?.id === lesson.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {lesson.is_completed ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : canAccessLesson(lesson) ? (
                          <Play size={20} className="text-blue-600" />
                        ) : (
                          <Lock size={20} className="text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {lessonIndex + 1}. {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">
                            {formatDuration(lesson.video_duration)}
                          </span>
                          {lesson.is_preview && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Free Preview
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
