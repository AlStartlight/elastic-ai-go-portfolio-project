package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"github.com/jmoiron/sqlx"

	"portfolio/internal/domain/course"
)

type coursePgRepository struct {
	db *sqlx.DB
}

func NewCoursePgRepository(db *sqlx.DB) course.Repository {
	return &coursePgRepository{db: db}
}

// CreateCourse creates a new course
func (r *coursePgRepository) CreateCourse(ctx context.Context, c *course.Course) error {
	c.ID = uuid.New().String()
	c.Slug = slug.Make(c.Title)
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()

	query := `
		INSERT INTO courses (id, title, slug, description, thumbnail, price, is_free, level, status, instructor_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err := r.db.ExecContext(ctx, query,
		c.ID, c.Title, c.Slug, c.Description, c.Thumbnail, c.Price,
		c.IsFree, c.Level, c.Status, c.InstructorID, c.CreatedAt, c.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create course: %w", err)
	}

	return nil
}

// GetCourseByID retrieves a course by ID with sections and lessons
func (r *coursePgRepository) GetCourseByID(ctx context.Context, id string) (*course.Course, error) {
	c := &course.Course{}

	query := `
		SELECT c.*, 
			COALESCE(COUNT(DISTINCT l.id), 0) as total_lessons,
			COALESCE(SUM(l.video_duration), 0) as total_duration
		FROM courses c
		LEFT JOIN course_sections cs ON cs.course_id = c.id
		LEFT JOIN lessons l ON l.section_id = cs.id
		WHERE c.id = $1
		GROUP BY c.id
	`

	err := r.db.GetContext(ctx, c, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("course not found")
		}
		return nil, err
	}

	// Load sections with lessons
	sections, err := r.GetSectionsByCourse(ctx, id)
	if err != nil {
		return nil, err
	}
	c.Sections = sections

	return c, nil
}

// GetCourseBySlug retrieves a course by slug
func (r *coursePgRepository) GetCourseBySlug(ctx context.Context, slugStr string) (*course.Course, error) {
	c := &course.Course{}

	query := `
		SELECT c.*, 
			COALESCE(COUNT(DISTINCT l.id), 0) as total_lessons,
			COALESCE(SUM(l.video_duration), 0) as total_duration
		FROM courses c
		LEFT JOIN course_sections cs ON cs.course_id = c.id
		LEFT JOIN lessons l ON l.section_id = cs.id
		WHERE c.slug = $1
		GROUP BY c.id
	`

	err := r.db.GetContext(ctx, c, query, slugStr)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("course not found")
		}
		return nil, err
	}

	// Load sections with lessons
	sections, err := r.GetSectionsByCourse(ctx, c.ID)
	if err != nil {
		return nil, err
	}
	c.Sections = sections

	return c, nil
}

// GetCourses retrieves courses with filters and pagination (only published)
func (r *coursePgRepository) GetCourses(ctx context.Context, params course.CourseListParams) (*course.CourseListResponse, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 || params.Limit > 100 {
		params.Limit = 10
	}

	offset := (params.Page - 1) * params.Limit

	// Build query with filters
	query := `
		SELECT c.*, 
			COALESCE(COUNT(DISTINCT l.id), 0) as total_lessons,
			COALESCE(SUM(l.video_duration), 0) as total_duration
		FROM courses c
		LEFT JOIN course_sections cs ON cs.course_id = c.id
		LEFT JOIN lessons l ON l.section_id = cs.id
		WHERE c.status = 'published'
	`

	args := []interface{}{}
	argCount := 1

	if params.Level != "" {
		query += fmt.Sprintf(" AND c.level = $%d", argCount)
		args = append(args, params.Level)
		argCount++
	}

	if params.IsFree != nil {
		query += fmt.Sprintf(" AND c.is_free = $%d", argCount)
		args = append(args, *params.IsFree)
		argCount++
	}

	if params.Instructor != "" {
		query += fmt.Sprintf(" AND c.instructor_id = $%d", argCount)
		args = append(args, params.Instructor)
		argCount++
	}

	if params.Search != "" {
		query += fmt.Sprintf(" AND (c.title ILIKE $%d OR c.description ILIKE $%d)", argCount, argCount)
		args = append(args, "%"+params.Search+"%")
		argCount++
	}

	query += " GROUP BY c.id ORDER BY c.created_at DESC"

	// Count total
	countQuery := "SELECT COUNT(*) FROM (" + query + ") as counted"
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, err
	}

	// Add pagination
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, params.Limit, offset)

	courses := []*course.Course{}
	err = r.db.SelectContext(ctx, &courses, query, args...)
	if err != nil {
		return nil, err
	}

	totalPages := (total + params.Limit - 1) / params.Limit

	return &course.CourseListResponse{
		Courses:    courses,
		Total:      total,
		Page:       params.Page,
		TotalPages: totalPages,
	}, nil
}

// GetAllCourses retrieves all courses including drafts (admin only)
func (r *coursePgRepository) GetAllCourses(ctx context.Context, params course.CourseListParams) (*course.CourseListResponse, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 || params.Limit > 100 {
		params.Limit = 10
	}

	offset := (params.Page - 1) * params.Limit

	// Build query with filters - NO status filter
	query := `
		SELECT c.*, 
			COALESCE(COUNT(DISTINCT l.id), 0) as total_lessons,
			COALESCE(SUM(l.video_duration), 0) as total_duration
		FROM courses c
		LEFT JOIN course_sections cs ON cs.course_id = c.id
		LEFT JOIN lessons l ON l.section_id = cs.id
		WHERE 1=1
	`

	args := []interface{}{}
	argCount := 1

	if params.Level != "" {
		query += fmt.Sprintf(" AND c.level = $%d", argCount)
		args = append(args, params.Level)
		argCount++
	}

	if params.IsFree != nil {
		query += fmt.Sprintf(" AND c.is_free = $%d", argCount)
		args = append(args, *params.IsFree)
		argCount++
	}

	if params.Instructor != "" {
		query += fmt.Sprintf(" AND c.instructor_id = $%d", argCount)
		args = append(args, params.Instructor)
		argCount++
	}

	if params.Search != "" {
		query += fmt.Sprintf(" AND (c.title ILIKE $%d OR c.description ILIKE $%d)", argCount, argCount)
		args = append(args, "%"+params.Search+"%")
		argCount++
	}

	query += " GROUP BY c.id ORDER BY c.created_at DESC"

	// Count total
	countQuery := "SELECT COUNT(*) FROM (" + query + ") as counted"
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, err
	}

	// Add pagination
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, params.Limit, offset)

	courses := []*course.Course{}
	err = r.db.SelectContext(ctx, &courses, query, args...)
	if err != nil {
		return nil, err
	}

	totalPages := (total + params.Limit - 1) / params.Limit

	return &course.CourseListResponse{
		Courses:    courses,
		Total:      total,
		Page:       params.Page,
		TotalPages: totalPages,
	}, nil
}

// UpdateCourse updates a course
func (r *coursePgRepository) UpdateCourse(ctx context.Context, id string, updates course.UpdateCourseRequest) error {
	query := "UPDATE courses SET updated_at = $1"
	args := []interface{}{time.Now()}
	argCount := 2

	if updates.Title != nil {
		query += fmt.Sprintf(", title = $%d, slug = $%d", argCount, argCount+1)
		args = append(args, *updates.Title, slug.Make(*updates.Title))
		argCount += 2
	}
	if updates.Description != nil {
		query += fmt.Sprintf(", description = $%d", argCount)
		args = append(args, *updates.Description)
		argCount++
	}
	if updates.Thumbnail != nil {
		query += fmt.Sprintf(", thumbnail = $%d", argCount)
		args = append(args, *updates.Thumbnail)
		argCount++
	}
	if updates.Price != nil {
		query += fmt.Sprintf(", price = $%d", argCount)
		args = append(args, *updates.Price)
		argCount++
	}
	if updates.IsFree != nil {
		query += fmt.Sprintf(", is_free = $%d", argCount)
		args = append(args, *updates.IsFree)
		argCount++
	}
	if updates.Level != nil {
		query += fmt.Sprintf(", level = $%d", argCount)
		args = append(args, *updates.Level)
		argCount++
	}
	if updates.Status != nil {
		query += fmt.Sprintf(", status = $%d", argCount)
		args = append(args, *updates.Status)
		argCount++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, id)

	_, err := r.db.ExecContext(ctx, query, args...)
	return err
}

// DeleteCourse deletes a course
func (r *coursePgRepository) DeleteCourse(ctx context.Context, id string) error {
	query := "DELETE FROM courses WHERE id = $1"
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// CreateSection creates a new course section
func (r *coursePgRepository) CreateSection(ctx context.Context, s *course.Section) error {
	s.ID = uuid.New().String()
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()

	query := `
		INSERT INTO course_sections (id, course_id, title, description, order_index, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.ExecContext(ctx, query,
		s.ID, s.CourseID, s.Title, s.Description, s.OrderIndex, s.CreatedAt, s.UpdatedAt,
	)

	return err
}

// GetSectionsByCourse retrieves all sections for a course with lessons
func (r *coursePgRepository) GetSectionsByCourse(ctx context.Context, courseID string) ([]course.Section, error) {
	sections := []course.Section{}

	query := `
		SELECT * FROM course_sections
		WHERE course_id = $1
		ORDER BY order_index ASC
	`

	err := r.db.SelectContext(ctx, &sections, query, courseID)
	if err != nil {
		return nil, err
	}

	// Load lessons for each section
	for i := range sections {
		lessons, err := r.GetLessonsBySection(ctx, sections[i].ID)
		if err != nil {
			return nil, err
		}
		sections[i].Lessons = lessons
	}

	return sections, nil
}

// UpdateSection updates a section
func (r *coursePgRepository) UpdateSection(ctx context.Context, id string, s *course.Section) error {
	s.UpdatedAt = time.Now()

	query := `
		UPDATE course_sections 
		SET title = $1, description = $2, order_index = $3, updated_at = $4
		WHERE id = $5
	`

	_, err := r.db.ExecContext(ctx, query, s.Title, s.Description, s.OrderIndex, s.UpdatedAt, id)
	return err
}

// DeleteSection deletes a section
func (r *coursePgRepository) DeleteSection(ctx context.Context, id string) error {
	query := "DELETE FROM course_sections WHERE id = $1"
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// CreateLesson creates a new lesson
func (r *coursePgRepository) CreateLesson(ctx context.Context, l *course.Lesson) error {
	l.ID = uuid.New().String()
	l.CreatedAt = time.Now()
	l.UpdatedAt = time.Now()

	query := `
		INSERT INTO lessons (id, section_id, title, description, content, video_url, video_duration, order_index, is_preview, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err := r.db.ExecContext(ctx, query,
		l.ID, l.SectionID, l.Title, l.Description, l.Content, l.VideoURL,
		l.VideoDuration, l.OrderIndex, l.IsPreview, l.CreatedAt, l.UpdatedAt,
	)

	return err
}

// GetLessonsBySection retrieves all lessons in a section
func (r *coursePgRepository) GetLessonsBySection(ctx context.Context, sectionID string) ([]course.Lesson, error) {
	lessons := []course.Lesson{}

	query := `
		SELECT * FROM lessons
		WHERE section_id = $1
		ORDER BY order_index ASC
	`

	err := r.db.SelectContext(ctx, &lessons, query, sectionID)
	return lessons, err
}

// GetLessonByID retrieves a lesson by ID
func (r *coursePgRepository) GetLessonByID(ctx context.Context, id string) (*course.Lesson, error) {
	l := &course.Lesson{}

	query := "SELECT * FROM lessons WHERE id = $1"
	err := r.db.GetContext(ctx, l, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("lesson not found")
		}
		return nil, err
	}

	return l, nil
}

// UpdateLesson updates a lesson
func (r *coursePgRepository) UpdateLesson(ctx context.Context, id string, l *course.Lesson) error {
	l.UpdatedAt = time.Now()

	query := `
		UPDATE lessons 
		SET title = $1, description = $2, content = $3, video_url = $4, 
		    video_duration = $5, order_index = $6, is_preview = $7, updated_at = $8
		WHERE id = $9
	`

	_, err := r.db.ExecContext(ctx, query,
		l.Title, l.Description, l.Content, l.VideoURL, l.VideoDuration,
		l.OrderIndex, l.IsPreview, l.UpdatedAt, id,
	)

	return err
}

// DeleteLesson deletes a lesson
func (r *coursePgRepository) DeleteLesson(ctx context.Context, id string) error {
	query := "DELETE FROM lessons WHERE id = $1"
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// Enroll enrolls a user in a course
func (r *coursePgRepository) Enroll(ctx context.Context, userID, courseID string) error {
	id := uuid.New().String()
	now := time.Now()

	query := `
		INSERT INTO enrollments (id, user_id, course_id, enrolled_at, progress)
		VALUES ($1, $2, $3, $4, 0)
	`

	_, err := r.db.ExecContext(ctx, query, id, userID, courseID, now)
	return err
}

// GetEnrollment gets enrollment info
func (r *coursePgRepository) GetEnrollment(ctx context.Context, userID, courseID string) (*course.Enrollment, error) {
	e := &course.Enrollment{}

	query := "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2"
	err := r.db.GetContext(ctx, e, query, userID, courseID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return e, nil
}

// GetUserEnrollments gets all enrollments for a user
func (r *coursePgRepository) GetUserEnrollments(ctx context.Context, userID string) ([]*course.Enrollment, error) {
	enrollments := []*course.Enrollment{}

	query := `
		SELECT e.*, c.title, c.slug, c.thumbnail, c.level
		FROM enrollments e
		JOIN courses c ON c.id = e.course_id
		WHERE e.user_id = $1
		ORDER BY e.enrolled_at DESC
	`

	err := r.db.SelectContext(ctx, &enrollments, query, userID)
	return enrollments, err
}

// UpdateProgress updates enrollment progress
func (r *coursePgRepository) UpdateProgress(ctx context.Context, userID, courseID string, progress int) error {
	query := "UPDATE enrollments SET progress = $1 WHERE user_id = $2 AND course_id = $3"
	_, err := r.db.ExecContext(ctx, query, progress, userID, courseID)
	return err
}

// MarkLessonComplete marks a lesson as complete
func (r *coursePgRepository) MarkLessonComplete(ctx context.Context, userID, lessonID string) error {
	// Check if progress exists
	var exists bool
	checkQuery := "SELECT EXISTS(SELECT 1 FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2)"
	err := r.db.GetContext(ctx, &exists, checkQuery, userID, lessonID)
	if err != nil {
		return err
	}

	now := time.Now()

	if exists {
		query := `
			UPDATE lesson_progress 
			SET completed = true, completed_at = $1, last_watched_at = $1
			WHERE user_id = $2 AND lesson_id = $3
		`
		_, err = r.db.ExecContext(ctx, query, now, userID, lessonID)
	} else {
		id := uuid.New().String()
		query := `
			INSERT INTO lesson_progress (id, user_id, lesson_id, completed, completed_at, last_watched_at, watch_duration)
			VALUES ($1, $2, $3, true, $4, $4, 0)
		`
		_, err = r.db.ExecContext(ctx, query, id, userID, lessonID, now)
	}

	return err
}

// GetLessonProgress gets progress for a specific lesson
func (r *coursePgRepository) GetLessonProgress(ctx context.Context, userID, lessonID string) (*course.LessonProgress, error) {
	p := &course.LessonProgress{}

	query := "SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2"
	err := r.db.GetContext(ctx, p, query, userID, lessonID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return p, nil
}

// GetCourseProgress calculates overall progress for a course
func (r *coursePgRepository) GetCourseProgress(ctx context.Context, userID, courseID string) (int, error) {
	var progress int

	query := `
		SELECT COALESCE(
			ROUND(
				(COUNT(CASE WHEN lp.completed = true THEN 1 END)::numeric / 
				COUNT(l.id)::numeric) * 100
			), 0
		) as progress
		FROM lessons l
		JOIN course_sections cs ON cs.id = l.section_id
		LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = $1
		WHERE cs.course_id = $2
	`

	err := r.db.GetContext(ctx, &progress, query, userID, courseID)
	return progress, err
}
