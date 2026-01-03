package usecase

import (
	"context"
	"fmt"

	"portfolio/internal/domain/course"
)

type courseUsecase struct {
	courseRepo course.Repository
}

func NewCourseUsecase(repo course.Repository) course.Usecase {
	return &courseUsecase{
		courseRepo: repo,
	}
}

// CreateCourse creates a new course
func (u *courseUsecase) CreateCourse(ctx context.Context, req course.CreateCourseRequest, instructorID string) (*course.Course, error) {
	// Validate level
	if req.Level != "" && req.Level != "beginner" && req.Level != "intermediate" && req.Level != "advanced" {
		return nil, fmt.Errorf("invalid level: must be beginner, intermediate, or advanced")
	}

	// Validate status
	if req.Status != "" && req.Status != "draft" && req.Status != "published" {
		return nil, fmt.Errorf("invalid status: must be draft or published")
	}

	// Set defaults
	if req.Level == "" {
		req.Level = "beginner"
	}
	if req.Status == "" {
		req.Status = "draft"
	}

	c := &course.Course{
		Title:        req.Title,
		Description:  req.Description,
		Thumbnail:    req.Thumbnail,
		Price:        req.Price,
		IsFree:       req.IsFree,
		Level:        req.Level,
		Status:       req.Status,
		InstructorID: instructorID,
	}

	err := u.courseRepo.CreateCourse(ctx, c)
	if err != nil {
		return nil, err
	}

	return c, nil
}

// GetCourseByID retrieves a course by ID (admin)
func (u *courseUsecase) GetCourseByID(ctx context.Context, id string) (*course.Course, error) {
	return u.courseRepo.GetCourseByID(ctx, id)
}

// GetCourse retrieves a course by slug
func (u *courseUsecase) GetCourse(ctx context.Context, slug string, userID *string) (*course.Course, error) {
	c, err := u.courseRepo.GetCourseBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	// Check if user is enrolled
	if userID != nil {
		enrollment, err := u.courseRepo.GetEnrollment(ctx, *userID, c.ID)
		if err == nil && enrollment != nil {
			c.IsEnrolled = true

			// Get progress
			progress, err := u.courseRepo.GetCourseProgress(ctx, *userID, c.ID)
			if err == nil {
				// Update enrollment progress
				u.courseRepo.UpdateProgress(ctx, *userID, c.ID, progress)
			}
		}
	}

	// If not enrolled and not free, hide non-preview lessons
	if !c.IsEnrolled && !c.IsFree {
		for i := range c.Sections {
			filteredLessons := []course.Lesson{}
			for _, lesson := range c.Sections[i].Lessons {
				if lesson.IsPreview {
					filteredLessons = append(filteredLessons, lesson)
				}
			}
			c.Sections[i].Lessons = filteredLessons
		}
	}

	return c, nil
}

// GetCourses retrieves courses with filters (only published)
func (u *courseUsecase) GetCourses(ctx context.Context, params course.CourseListParams) (*course.CourseListResponse, error) {
	return u.courseRepo.GetCourses(ctx, params)
}

// GetAllCourses retrieves all courses including drafts (admin only)
func (u *courseUsecase) GetAllCourses(ctx context.Context, params course.CourseListParams) (*course.CourseListResponse, error) {
	return u.courseRepo.GetAllCourses(ctx, params)
}

// UpdateCourse updates a course
func (u *courseUsecase) UpdateCourse(ctx context.Context, id string, req course.UpdateCourseRequest) error {
	// Validate level if provided
	if req.Level != nil {
		if *req.Level != "beginner" && *req.Level != "intermediate" && *req.Level != "advanced" {
			return fmt.Errorf("invalid level: must be beginner, intermediate, or advanced")
		}
	}

	// Validate status if provided
	if req.Status != nil {
		if *req.Status != "draft" && *req.Status != "published" {
			return fmt.Errorf("invalid status: must be draft or published")
		}
	}

	return u.courseRepo.UpdateCourse(ctx, id, req)
}

// DeleteCourse deletes a course
func (u *courseUsecase) DeleteCourse(ctx context.Context, id string) error {
	return u.courseRepo.DeleteCourse(ctx, id)
}

// CreateSection creates a new section in a course
func (u *courseUsecase) CreateSection(ctx context.Context, req course.CreateSectionRequest) (*course.Section, error) {
	// Verify course exists
	_, err := u.courseRepo.GetCourseByID(ctx, req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("course not found: %w", err)
	}

	s := &course.Section{
		CourseID:    req.CourseID,
		Title:       req.Title,
		Description: req.Description,
		OrderIndex:  req.OrderIndex,
	}

	err = u.courseRepo.CreateSection(ctx, s)
	if err != nil {
		return nil, err
	}

	return s, nil
}

// CreateLesson creates a new lesson in a section
func (u *courseUsecase) CreateLesson(ctx context.Context, req course.CreateLessonRequest) (*course.Lesson, error) {
	l := &course.Lesson{
		SectionID:     req.SectionID,
		Title:         req.Title,
		Description:   req.Description,
		Content:       req.Content,
		VideoURL:      req.VideoURL,
		VideoDuration: req.VideoDuration,
		OrderIndex:    req.OrderIndex,
		IsPreview:     req.IsPreview,
	}

	err := u.courseRepo.CreateLesson(ctx, l)
	if err != nil {
		return nil, err
	}

	return l, nil
}

// DeleteSection deletes a section and all its lessons
func (u *courseUsecase) DeleteSection(ctx context.Context, sectionID string) error {
	return u.courseRepo.DeleteSection(ctx, sectionID)
}

// DeleteLesson deletes a lesson
func (u *courseUsecase) DeleteLesson(ctx context.Context, lessonID string) error {
	return u.courseRepo.DeleteLesson(ctx, lessonID)
}

// GetCourseCurriculum retrieves the full curriculum for a course
func (u *courseUsecase) GetCourseCurriculum(ctx context.Context, courseID string) ([]course.Section, error) {
	return u.courseRepo.GetSectionsByCourse(ctx, courseID)
}

// EnrollCourse enrolls a user in a course
func (u *courseUsecase) EnrollCourse(ctx context.Context, userID, courseID string) error {
	// Check if already enrolled
	enrollment, err := u.courseRepo.GetEnrollment(ctx, userID, courseID)
	if err != nil {
		return err
	}

	if enrollment != nil {
		return fmt.Errorf("already enrolled in this course")
	}

	// Verify course exists and is published
	c, err := u.courseRepo.GetCourseByID(ctx, courseID)
	if err != nil {
		return fmt.Errorf("course not found: %w", err)
	}

	if c.Status != "published" {
		return fmt.Errorf("course is not published")
	}

	// For paid courses, you would check payment here
	// For now, we'll allow free enrollment
	if !c.IsFree {
		// TODO: Verify payment before enrolling
		return fmt.Errorf("payment required for this course")
	}

	return u.courseRepo.Enroll(ctx, userID, courseID)
}

// GetMyEnrollments retrieves all enrollments for a user
func (u *courseUsecase) GetMyEnrollments(ctx context.Context, userID string) ([]*course.Enrollment, error) {
	enrollments, err := u.courseRepo.GetUserEnrollments(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Update progress for each enrollment
	for _, enrollment := range enrollments {
		progress, err := u.courseRepo.GetCourseProgress(ctx, userID, enrollment.CourseID)
		if err == nil {
			enrollment.Progress = progress
		}
	}

	return enrollments, nil
}

// MarkLessonComplete marks a lesson as completed for a user
func (u *courseUsecase) MarkLessonComplete(ctx context.Context, userID, lessonID string) error {
	// Verify lesson exists
	lesson, err := u.courseRepo.GetLessonByID(ctx, lessonID)
	if err != nil {
		return fmt.Errorf("lesson not found: %w", err)
	}

	// Get section to find course
	sections, err := u.courseRepo.GetSectionsByCourse(ctx, "")
	if err != nil {
		return err
	}

	var courseID string
	for _, section := range sections {
		if section.ID == lesson.SectionID {
			courseID = section.CourseID
			break
		}
	}

	if courseID == "" {
		return fmt.Errorf("course not found for lesson")
	}

	// Verify user is enrolled
	enrollment, err := u.courseRepo.GetEnrollment(ctx, userID, courseID)
	if err != nil {
		return err
	}
	if enrollment == nil {
		return fmt.Errorf("not enrolled in this course")
	}

	// Mark lesson complete
	err = u.courseRepo.MarkLessonComplete(ctx, userID, lessonID)
	if err != nil {
		return err
	}

	// Update overall course progress
	progress, err := u.courseRepo.GetCourseProgress(ctx, userID, courseID)
	if err == nil {
		u.courseRepo.UpdateProgress(ctx, userID, courseID, progress)
	}

	return nil
}

// GetCourseProgress retrieves the progress percentage for a user in a course
func (u *courseUsecase) GetCourseProgress(ctx context.Context, userID, courseID string) (int, error) {
	// Verify enrollment
	enrollment, err := u.courseRepo.GetEnrollment(ctx, userID, courseID)
	if err != nil {
		return 0, err
	}
	if enrollment == nil {
		return 0, fmt.Errorf("not enrolled in this course")
	}

	return u.courseRepo.GetCourseProgress(ctx, userID, courseID)
}
