import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, GripVertical, Video, FileText, ArrowLeft, Download, BookOpen } from 'lucide-react';
import * as courseApi from '../../api/courseApi';

type LessonType = 'video' | 'text' | 'quiz';

const CourseBuilder: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<courseApi.Course | null>(null);
  const [sections, setSections] = useState<courseApi.Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentSection, setCurrentSection] = useState<courseApi.Section | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lessonType, setLessonType] = useState<LessonType>('video');

  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    video_duration: 0,
    is_preview: false,
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Use getCourseById since courseId from URL is the course ID, not slug
      const courseData = await courseApi.getCourseById(courseId!);
      setCourse(courseData);

      const curriculum = await courseApi.getCourseCurriculum(courseData.id);
      setSections(curriculum);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!course) return;

      await courseApi.createSection({
        course_id: course.id,
        title: sectionForm.title,
        description: sectionForm.description,
        order_index: sections.length,
      });

      await fetchCourseData();
      setShowSectionModal(false);
      setSectionForm({ title: '', description: '' });
    } catch (error) {
      console.error('Failed to create section:', error);
      alert('Failed to create section');
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentSection) return;

      setUploading(true);

      // Use YouTube URL directly (no upload needed)
      await courseApi.createLesson({
        section_id: currentSection.id,
        title: lessonForm.title,
        description: lessonForm.description,
        content: lessonForm.content,
        video_url: lessonForm.video_url,
        video_duration: lessonForm.video_duration,
        order_index: currentSection.lessons?.length || 0,
        is_preview: lessonForm.is_preview,
      });

      await fetchCourseData();
      setShowLessonModal(false);
      setCurrentSection(null);
      setVideoFile(null);
      setLessonForm({
        title: '',
        description: '',
        content: '',
        video_url: '',
        video_duration: 0,
        is_preview: false,
      });
    } catch (error) {
      console.error('Failed to create lesson:', error);
      alert('Failed to create lesson');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${sectionTitle}"?\n\nThis will also delete all lessons in this section.`)) {
      return;
    }

    try {
      await courseApi.deleteSection(sectionId);
      await fetchCourseData();
    } catch (error) {
      console.error('Failed to delete section:', error);
      alert('Failed to delete section. Please try again.');
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${lessonTitle}"?`)) {
      return;
    }

    try {
      await courseApi.deleteLesson(lessonId);
      await fetchCourseData();
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Failed to delete lesson. Please try again.');
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      // Get video duration (optional)
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        setLessonForm({ ...lessonForm, video_duration: Math.floor(video.duration) });
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
      <div className="p-6">
        <p className="text-red-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-1">Build your course curriculum</p>
            </div>
            <button
              onClick={() => setShowSectionModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Section
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {sections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-600 mb-4">Create your first section to start building your course</p>
            <button
              onClick={() => setShowSectionModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Section
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-white rounded-lg shadow-sm border">
                {/* Section Header */}
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical size={20} className="text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Section {sectionIndex + 1}: {section.title}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-gray-600">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCurrentSection(section);
                        setShowLessonModal(true);
                      }}
                      className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-100"
                    >
                      <Plus size={16} />
                      Add Lesson
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id, section.title)}
                      className="p-2 text-gray-600 hover:text-red-600"
                      title="Delete section"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                <div className="divide-y">
                  {section.lessons && section.lessons.length > 0 ? (
                    section.lessons.map((lesson, lessonIndex) => {
                      const hasVideo = lesson.video_url && lesson.video_url.trim() !== '';
                      const hasContent = lesson.content && lesson.content.trim() !== '';
                      const lessonType = hasVideo ? 'video' : hasContent ? 'text' : 'other';
                      
                      return (
                        <div
                          key={lesson.id}
                          className="p-4 hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical size={16} className="text-gray-400" />
                            {lessonType === 'video' && <Video size={20} className="text-blue-600" />}
                            {lessonType === 'text' && <BookOpen size={20} className="text-green-600" />}
                            {lessonType === 'other' && <FileText size={20} className="text-gray-600" />}
                            <div>
                              <p className="font-medium text-gray-900">
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                {lessonType === 'video' && lesson.video_duration > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Video size={14} />
                                    {formatDuration(lesson.video_duration)}
                                  </span>
                                )}
                                {lessonType === 'text' && (
                                  <span className="flex items-center gap-1">
                                    <BookOpen size={14} />
                                    Article
                                  </span>
                                )}
                                {lesson.is_preview && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="p-2 text-gray-600 hover:text-blue-600"
                              title="Edit lesson"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                              className="p-2 text-gray-600 hover:text-red-600"
                              title="Delete lesson"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm">No lessons yet. Click "Add Lesson" to create one.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Section</h2>
              <form onSubmit={handleAddSection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title*
                  </label>
                  <input
                    type="text"
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Introduction to React"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={sectionForm.description}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Brief description of this section..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSectionModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Lesson</h2>
              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Lesson Type*
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setLessonType('video')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                        lessonType === 'video'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Video size={24} className={lessonType === 'video' ? 'text-blue-600' : 'text-gray-600'} />
                      <span className={`text-sm font-medium ${lessonType === 'video' ? 'text-blue-600' : 'text-gray-700'}`}>
                        Video
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonType('text')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                        lessonType === 'text'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <BookOpen size={24} className={lessonType === 'text' ? 'text-blue-600' : 'text-gray-600'} />
                      <span className={`text-sm font-medium ${lessonType === 'text' ? 'text-blue-600' : 'text-gray-700'}`}>
                        Article/Text
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonType('quiz')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                        lessonType === 'quiz'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FileText size={24} className={lessonType === 'quiz' ? 'text-blue-600' : 'text-gray-600'} />
                      <span className={`text-sm font-medium ${lessonType === 'quiz' ? 'text-blue-600' : 'text-gray-700'}`}>
                        Quiz/Exercise
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Title*
                  </label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={
                      lessonType === 'video'
                        ? 'e.g., Introduction to React Hooks'
                        : lessonType === 'text'
                        ? 'e.g., Understanding State Management'
                        : 'e.g., Practice Exercise - Build a Todo App'
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Brief description of what students will learn..."
                  />
                </div>

                {lessonType === 'video' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        YouTube Video URL*
                      </label>
                      <input
                        type="url"
                        value={lessonForm.video_url}
                        onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://www.youtube.com/watch?v=..."
                        required={lessonType === 'video'}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use private or unlisted YouTube videos for your paid content
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video Duration (minutes)*
                      </label>
                      <input
                        type="number"
                        value={lessonForm.video_duration}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, video_duration: Number(e.target.value) })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="e.g., 15"
                        min="0"
                        required={lessonType === 'video'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={lessonForm.content}
                        onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                        placeholder="Add video transcript, key points, code snippets, or resources..."
                      />
                    </div>
                  </>
                )}

                {lessonType === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Article Content*
                    </label>
                    <textarea
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-64 font-mono text-sm"
                      placeholder="Write your article content here. You can use Markdown formatting:&#10;&#10;# Heading 1&#10;## Heading 2&#10;**Bold text**&#10;*Italic text*&#10;- Bullet points&#10;1. Numbered lists&#10;`code`&#10;```&#10;code blocks&#10;```"
                      required={lessonType === 'text'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supports Markdown formatting. Students can read this as article content.
                    </p>
                  </div>
                )}

                {lessonType === 'quiz' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exercise Instructions*
                    </label>
                    <textarea
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-48"
                      placeholder="Provide clear instructions for the quiz or coding exercise:&#10;&#10;- What should students do?&#10;- What are the requirements?&#10;- What resources can they use?&#10;- How will they submit their work?"
                      required={lessonType === 'quiz'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Quiz/exercise implementation coming soon. For now, provide instructions for manual review.
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={lessonForm.is_preview}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, is_preview: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Allow free preview (accessible without enrollment)
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Great for first lesson or introduction to attract students
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLessonModal(false);
                      setCurrentSection(null);
                      setVideoFile(null);
                    }}
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
                    {uploading ? 'Uploading...' : 'Add Lesson'}
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

export default CourseBuilder;
