package course

import (
	"context"
	"time"
)

// Course represents an online course
type Course struct {
	ID           string    `json:"id" db:"id"`
	Title        string    `json:"title" db:"title"`
	Slug         string    `json:"slug" db:"slug"`
	Description  string    `json:"description" db:"description"`
	Thumbnail    string    `json:"thumbnail" db:"thumbnail"`
	Price        float64   `json:"price" db:"price"`
	IsFree       bool      `json:"is_free" db:"is_free"`
	Level        string    `json:"level" db:"level"`   // beginner, intermediate, advanced
	Status       string    `json:"status" db:"status"` // draft, published
	InstructorID string    `json:"instructor_id" db:"instructor_id"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`

	// Relations (not in DB)
	Sections      []Section   `json:"sections,omitempty" db:"-"`
	Instructor    *Instructor `json:"instructor,omitempty" db:"-"`
	TotalLessons  int         `json:"total_lessons" db:"total_lessons"`
	TotalDuration int         `json:"total_duration" db:"total_duration"` // in seconds
	IsEnrolled    bool        `json:"is_enrolled" db:"-"`
}

// Section represents a course section/module
type Section struct {
	ID          string    `json:"id" db:"id"`
	CourseID    string    `json:"course_id" db:"course_id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	OrderIndex  int       `json:"order_index" db:"order_index"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`

	// Relations
	Lessons []Lesson `json:"lessons,omitempty" db:"-"`
}

// Lesson represents a single lesson within a section
type Lesson struct {
	ID            string    `json:"id" db:"id"`
	SectionID     string    `json:"section_id" db:"section_id"`
	Title         string    `json:"title" db:"title"`
	Description   string    `json:"description" db:"description"`
	Content       string    `json:"content" db:"content"` // for text lessons
	VideoURL      string    `json:"video_url" db:"video_url"`
	VideoDuration int       `json:"video_duration" db:"video_duration"` // seconds
	OrderIndex    int       `json:"order_index" db:"order_index"`
	IsPreview     bool      `json:"is_preview" db:"is_preview"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`

	// Progress (for enrolled users)
	IsCompleted bool `json:"is_completed" db:"-"`
}

// Enrollment represents a user's enrollment in a course
type Enrollment struct {
	ID          string     `json:"id" db:"id"`
	UserID      string     `json:"user_id" db:"user_id"`
	CourseID    string     `json:"course_id" db:"course_id"`
	EnrolledAt  time.Time  `json:"enrolled_at" db:"enrolled_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty" db:"completed_at"`
	Progress    int        `json:"progress" db:"progress"` // 0-100

	// Relations
	Course *Course `json:"course,omitempty" db:"-"`
}

// LessonProgress tracks user progress on individual lessons
type LessonProgress struct {
	ID            string     `json:"id" db:"id"`
	UserID        string     `json:"user_id" db:"user_id"`
	LessonID      string     `json:"lesson_id" db:"lesson_id"`
	Completed     bool       `json:"completed" db:"completed"`
	CompletedAt   *time.Time `json:"completed_at,omitempty" db:"completed_at"`
	WatchDuration int        `json:"watch_duration" db:"watch_duration"`
	LastWatchedAt *time.Time `json:"last_watched_at,omitempty" db:"last_watched_at"`
}

// Instructor represents minimal instructor info
type Instructor struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Avatar string `json:"avatar,omitempty"`
}

// DTOs and Request/Response types

type CreateCourseRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Thumbnail   string  `json:"thumbnail"`
	Price       float64 `json:"price"`
	IsFree      bool    `json:"is_free"`
	Level       string  `json:"level"`
	Status      string  `json:"status"`
}

type UpdateCourseRequest struct {
	Title       *string  `json:"title,omitempty"`
	Description *string  `json:"description,omitempty"`
	Thumbnail   *string  `json:"thumbnail,omitempty"`
	Price       *float64 `json:"price,omitempty"`
	IsFree      *bool    `json:"is_free,omitempty"`
	Level       *string  `json:"level,omitempty"`
	Status      *string  `json:"status,omitempty"`
}

type CreateSectionRequest struct {
	CourseID    string `json:"course_id" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	OrderIndex  int    `json:"order_index"`
}

type CreateLessonRequest struct {
	SectionID     string `json:"section_id" binding:"required"`
	Title         string `json:"title" binding:"required"`
	Description   string `json:"description"`
	Content       string `json:"content"`
	VideoURL      string `json:"video_url"`
	VideoDuration int    `json:"video_duration"`
	OrderIndex    int    `json:"order_index"`
	IsPreview     bool   `json:"is_preview"`
}

type CourseListParams struct {
	Page       int    `form:"page"`
	Limit      int    `form:"limit"`
	Level      string `form:"level"`
	IsFree     *bool  `form:"is_free"`
	Instructor string `form:"instructor"`
	Search     string `form:"search"`
}

type CourseListResponse struct {
	Courses    []*Course `json:"courses"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	TotalPages int       `json:"total_pages"`
}

// Repository interface
type Repository interface {
	// Course operations
	CreateCourse(ctx context.Context, course *Course) error
	GetCourseByID(ctx context.Context, id string) (*Course, error)
	GetCourseBySlug(ctx context.Context, slug string) (*Course, error)
	GetCourses(ctx context.Context, params CourseListParams) (*CourseListResponse, error)
	GetAllCourses(ctx context.Context, params CourseListParams) (*CourseListResponse, error) // Admin only - includes drafts
	UpdateCourse(ctx context.Context, id string, updates UpdateCourseRequest) error
	DeleteCourse(ctx context.Context, id string) error

	// Section operations
	CreateSection(ctx context.Context, section *Section) error
	GetSectionsByCourse(ctx context.Context, courseID string) ([]Section, error)
	UpdateSection(ctx context.Context, id string, section *Section) error
	DeleteSection(ctx context.Context, id string) error

	// Lesson operations
	CreateLesson(ctx context.Context, lesson *Lesson) error
	GetLessonsBySection(ctx context.Context, sectionID string) ([]Lesson, error)
	GetLessonByID(ctx context.Context, id string) (*Lesson, error)
	UpdateLesson(ctx context.Context, id string, lesson *Lesson) error
	DeleteLesson(ctx context.Context, id string) error

	// Enrollment operations
	Enroll(ctx context.Context, userID, courseID string) error
	GetEnrollment(ctx context.Context, userID, courseID string) (*Enrollment, error)
	GetUserEnrollments(ctx context.Context, userID string) ([]*Enrollment, error)
	UpdateProgress(ctx context.Context, userID, courseID string, progress int) error

	// Progress tracking
	MarkLessonComplete(ctx context.Context, userID, lessonID string) error
	GetLessonProgress(ctx context.Context, userID, lessonID string) (*LessonProgress, error)
	GetCourseProgress(ctx context.Context, userID, courseID string) (int, error)
}

// Usecase interface
type Usecase interface {
	// Course operations
	CreateCourse(ctx context.Context, req CreateCourseRequest, instructorID string) (*Course, error)
	GetCourse(ctx context.Context, slug string, userID *string) (*Course, error)
	GetCourseByID(ctx context.Context, id string) (*Course, error)
	GetCourses(ctx context.Context, params CourseListParams) (*CourseListResponse, error)
	GetAllCourses(ctx context.Context, params CourseListParams) (*CourseListResponse, error) // Admin only - includes drafts
	UpdateCourse(ctx context.Context, id string, req UpdateCourseRequest) error
	DeleteCourse(ctx context.Context, id string) error

	// Curriculum building
	CreateSection(ctx context.Context, req CreateSectionRequest) (*Section, error)
	CreateLesson(ctx context.Context, req CreateLessonRequest) (*Lesson, error)
	DeleteSection(ctx context.Context, sectionID string) error
	DeleteLesson(ctx context.Context, lessonID string) error
	GetCourseCurriculum(ctx context.Context, courseID string) ([]Section, error)

	// Student operations
	EnrollCourse(ctx context.Context, userID, courseID string) error
	GetMyEnrollments(ctx context.Context, userID string) ([]*Enrollment, error)
	MarkLessonComplete(ctx context.Context, userID, lessonID string) error
	GetCourseProgress(ctx context.Context, userID, courseID string) (int, error)
}
