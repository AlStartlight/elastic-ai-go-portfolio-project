import axiosClient from './axiosClient';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  price: number;
  is_free: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  instructor_id: string;
  created_at: string;
  updated_at: string;
  sections?: Section[];
  total_lessons: number;
  total_duration: number;
  is_enrolled: boolean;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description: string;
  content: string;
  video_url: string;
  video_duration: number;
  order_index: number;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
  is_completed: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress: number;
  course?: Course;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  is_free: boolean;
  level: string;
  status: string;
}

export interface CreateSectionRequest {
  course_id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface CreateLessonRequest {
  section_id: string;
  title: string;
  description: string;
  content: string;
  video_url: string;
  video_duration: number;
  order_index: number;
  is_preview: boolean;
}

export interface CourseListParams {
  page?: number;
  limit?: number;
  level?: string;
  is_free?: boolean;
  search?: string;
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  total_pages: number;
}

// Public API
export const getCourses = async (params?: CourseListParams): Promise<CourseListResponse> => {
  const { data } = await axiosClient.get('/api/public/courses', { params });
  return data;
};

export const getCourseBySlug = async (slug: string): Promise<Course> => {
  const { data } = await axiosClient.get(`/api/public/courses/${slug}`);
  return data.data;
};

// Admin API
export const getAllCourses = async (params?: CourseListParams): Promise<CourseListResponse> => {
  const { data } = await axiosClient.get('/api/admin/courses', { params });
  return data;
};

export const getCourseById = async (id: string): Promise<Course> => {
  const { data } = await axiosClient.get(`/api/admin/courses/${id}`);
  return data.data;
};

export const createCourse = async (courseData: CreateCourseRequest): Promise<Course> => {
  const { data } = await axiosClient.post('/api/admin/courses', courseData);
  return data.data;
};

export const updateCourse = async (
  id: string,
  courseData: Partial<CreateCourseRequest>
): Promise<void> => {
  await axiosClient.put(`/api/admin/courses/${id}`, courseData);
};

export const deleteCourse = async (id: string): Promise<void> => {
  await axiosClient.delete(`/api/admin/courses/${id}`);
};

export const createSection = async (sectionData: CreateSectionRequest): Promise<Section> => {
  const { data } = await axiosClient.post('/api/admin/sections', sectionData);
  return data.data;
};

export const deleteSection = async (sectionId: string): Promise<void> => {
  await axiosClient.delete(`/api/admin/sections/${sectionId}`);
};

export const createLesson = async (lessonData: CreateLessonRequest): Promise<Lesson> => {
  const { data } = await axiosClient.post('/api/admin/lessons', lessonData);
  return data.data;
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
  await axiosClient.delete(`/api/admin/lessons/${lessonId}`);
};

export const getCourseCurriculum = async (courseId: string): Promise<Section[]> => {
  const { data } = await axiosClient.get(`/api/admin/courses/${courseId}/curriculum`);
  return data.data;
};

// Upload thumbnail to Cloudinary
export const uploadThumbnail = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('thumbnail', file);
  const { data } = await axiosClient.post('/api/admin/upload/thumbnail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};

// List all thumbnails from Cloudinary
export interface CloudinaryImage {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

export const listThumbnails = async (maxResults: number = 50): Promise<CloudinaryImage[]> => {
  const { data } = await axiosClient.get(`/api/admin/upload/thumbnails?max_results=${maxResults}`);
  return data.data || [];
};

// Student API
export const enrollCourse = async (courseId: string): Promise<void> => {
  await axiosClient.post(`/api/student/courses/${courseId}/enroll`);
};

export const getMyEnrollments = async (): Promise<Enrollment[]> => {
  const { data } = await axiosClient.get('/api/student/enrollments');
  return data.data;
};

export const markLessonComplete = async (lessonId: string): Promise<void> => {
  await axiosClient.post(`/api/student/lessons/${lessonId}/complete`);
};

export const getCourseProgress = async (courseId: string): Promise<number> => {
  const { data } = await axiosClient.get(`/api/student/courses/${courseId}/progress`);
  return data.progress;
};
