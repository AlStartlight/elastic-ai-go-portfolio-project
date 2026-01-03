package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"

	"portfolio/internal/domain/course"
	"portfolio/internal/infrastructure/cloudinary"
)

type CourseHandler struct {
	courseUC         course.Usecase
	cloudinaryClient *cloudinary.CloudinaryClient
}

func NewCourseHandler(courseUC course.Usecase, cloudinaryClient *cloudinary.CloudinaryClient) *CourseHandler {
	return &CourseHandler{
		courseUC:         courseUC,
		cloudinaryClient: cloudinaryClient,
	}
}

// CreateCourse creates a new course (admin/instructor only)
func (h *CourseHandler) CreateCourse(c *gin.Context) {
	var req course.CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get instructor ID from JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	instructorID, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	createdCourse, err := h.courseUC.CreateCourse(c.Request.Context(), req, instructorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Course created successfully",
		"data":    createdCourse,
	})
}

// GetCourse retrieves a course by slug (public)
func (h *CourseHandler) GetCourse(c *gin.Context) {
	slug := c.Param("slug")

	// Get user ID if authenticated
	var userID *string
	if uid, exists := c.Get("user_id"); exists {
		if uidStr, ok := uid.(string); ok {
			userID = &uidStr
		}
	}

	retrievedCourse, err := h.courseUC.GetCourse(c.Request.Context(), slug, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": retrievedCourse})
}

// GetCourseByID retrieves a course by ID (admin only)
func (h *CourseHandler) GetCourseByID(c *gin.Context) {
	id := c.Param("id")

	retrievedCourse, err := h.courseUC.GetCourseByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": retrievedCourse})
}

// GetCourses retrieves courses with filters (public - only published)
func (h *CourseHandler) GetCourses(c *gin.Context) {
	var params course.CourseListParams

	// Bind query parameters
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.courseUC.GetCourses(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetAllCourses retrieves all courses including drafts (admin only)
func (h *CourseHandler) GetAllCourses(c *gin.Context) {
	var params course.CourseListParams

	// Bind query parameters
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Use GetAllCourses from usecase which doesn't filter by status
	response, err := h.courseUC.GetAllCourses(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// UpdateCourse updates a course
func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	id := c.Param("id")

	var req course.UpdateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.courseUC.UpdateCourse(c.Request.Context(), id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course updated successfully"})
}

// DeleteCourse deletes a course
func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	id := c.Param("id")

	err := h.courseUC.DeleteCourse(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}

// CreateSection creates a new section in a course
func (h *CourseHandler) CreateSection(c *gin.Context) {
	var req course.CreateSectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	section, err := h.courseUC.CreateSection(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Section created successfully",
		"data":    section,
	})
}

// CreateLesson creates a new lesson in a section
func (h *CourseHandler) CreateLesson(c *gin.Context) {
	var req course.CreateLessonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lesson, err := h.courseUC.CreateLesson(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Lesson created successfully",
		"data":    lesson,
	})
}

// DeleteSection deletes a section
func (h *CourseHandler) DeleteSection(c *gin.Context) {
	sectionID := c.Param("id")

	err := h.courseUC.DeleteSection(c.Request.Context(), sectionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Section deleted successfully"})
}

// DeleteLesson deletes a lesson
func (h *CourseHandler) DeleteLesson(c *gin.Context) {
	lessonID := c.Param("id")

	err := h.courseUC.DeleteLesson(c.Request.Context(), lessonID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lesson deleted successfully"})
}

// GetCourseCurriculum retrieves the full curriculum
func (h *CourseHandler) GetCourseCurriculum(c *gin.Context) {
	courseID := c.Param("id")

	sections, err := h.courseUC.GetCourseCurriculum(c.Request.Context(), courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": sections})
}

// EnrollCourse enrolls the authenticated user in a course
func (h *CourseHandler) EnrollCourse(c *gin.Context) {
	courseID := c.Param("id")

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	uidStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	err := h.courseUC.EnrollCourse(c.Request.Context(), uidStr, courseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully enrolled in course"})
}

// GetMyEnrollments retrieves all enrollments for authenticated user
func (h *CourseHandler) GetMyEnrollments(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	uidStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	enrollments, err := h.courseUC.GetMyEnrollments(c.Request.Context(), uidStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": enrollments})
}

// MarkLessonComplete marks a lesson as completed
func (h *CourseHandler) MarkLessonComplete(c *gin.Context) {
	lessonID := c.Param("id")

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	uidStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	err := h.courseUC.MarkLessonComplete(c.Request.Context(), uidStr, lessonID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lesson marked as complete"})
}

// GetCourseProgress retrieves progress for a course
func (h *CourseHandler) GetCourseProgress(c *gin.Context) {
	courseID := c.Param("id")

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	uidStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	progress, err := h.courseUC.GetCourseProgress(c.Request.Context(), uidStr, courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"progress": progress})
}

// UploadVideo is deprecated - use YouTube URLs instead
func (h *CourseHandler) UploadVideo(c *gin.Context) {
	c.JSON(http.StatusBadRequest, gin.H{
		"error": "Video upload is deprecated. Please use YouTube URLs for course videos.",
	})
}

// UploadThumbnail handles thumbnail upload to Cloudinary
func (h *CourseHandler) UploadThumbnail(c *gin.Context) {
	// Check if Cloudinary is configured
	if h.cloudinaryClient == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Image upload service not configured. Please add Cloudinary credentials to .env file",
			"url":   "", // Return empty URL so course can still be created
		})
		return
	}

	file, header, err := c.Request.FormFile("thumbnail")
	if err != nil {
		fmt.Printf("Error getting form file: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "thumbnail file required: " + err.Error()})
		return
	}
	defer file.Close()

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("course_thumbnail_%d%s", time.Now().Unix(), ext)

	fmt.Printf("Uploading file: %s (size: %d bytes)\n", filename, header.Size)

	// Upload to Cloudinary
	thumbnailURL, err := h.cloudinaryClient.UploadThumbnail(c.Request.Context(), file, filename)
	if err != nil {
		fmt.Printf("Cloudinary upload error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload thumbnail: " + err.Error()})
		return
	}

	fmt.Printf("Upload successful: %s\n", thumbnailURL)

	c.JSON(http.StatusOK, gin.H{
		"message": "Thumbnail uploaded successfully",
		"url":     thumbnailURL,
	})
}

// ListThumbnails lists all uploaded thumbnails from Cloudinary
func (h *CourseHandler) ListThumbnails(c *gin.Context) {
	// Check if Cloudinary is configured
	if h.cloudinaryClient == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Image upload service not configured",
			"data":  []interface{}{},
		})
		return
	}

	// Get max results from query param, default to 50
	maxResults := 50
	if max := c.Query("max_results"); max != "" {
		fmt.Sscanf(max, "%d", &maxResults)
	}

	images, err := h.cloudinaryClient.ListImages(c.Request.Context(), maxResults)
	if err != nil {
		fmt.Printf("Failed to list images: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to list images: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Images retrieved successfully",
		"data":    images,
	})
}
