package cloudinary

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/admin"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryClient struct {
	cld *cloudinary.Cloudinary
}

// NewCloudinaryClient creates a new Cloudinary client
func NewCloudinaryClient() (*CloudinaryClient, error) {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return nil, fmt.Errorf("cloudinary credentials not configured")
	}

	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize cloudinary: %w", err)
	}

	return &CloudinaryClient{cld: cld}, nil
}

// UploadImage uploads an image to Cloudinary (defaults to articles/images folder)
func (c *CloudinaryClient) UploadImage(ctx context.Context, file multipart.File, filename string) (string, error) {
	return c.UploadImageToFolder(ctx, file, filename, "articles/images")
}

// UploadImageToFolder uploads an image to a specific Cloudinary folder
func (c *CloudinaryClient) UploadImageToFolder(ctx context.Context, file multipart.File, filename string, folder string) (string, error) {
	// Read file into bytes
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Printf("Cloudinary: Failed to read file: %v\n", err)
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	fmt.Printf("Cloudinary: Uploading %d bytes to folder %s with name %s\n", len(fileBytes), folder, filename)

	// Remove file extension from filename for Cloudinary PublicID
	publicID := filename
	if idx := len(filename) - len(filepath.Ext(filename)); idx > 0 {
		publicID = filename[:idx]
	}

	// Create a reader from bytes for Cloudinary
	reader := bytes.NewReader(fileBytes)

	// Upload to Cloudinary
	uploadResult, err := c.cld.Upload.Upload(ctx, reader, uploader.UploadParams{
		PublicID:     publicID,
		Folder:       folder,
		ResourceType: "image",
	})
	if err != nil {
		fmt.Printf("Cloudinary: Upload failed: %v\n", err)
		return "", fmt.Errorf("failed to upload to cloudinary: %w", err)
	}

	fmt.Printf("Cloudinary: Upload successful, URL: %s\n", uploadResult.SecureURL)
	return uploadResult.SecureURL, nil
}

// UploadThumbnail is a convenience method for uploading course thumbnails
func (c *CloudinaryClient) UploadThumbnail(ctx context.Context, file multipart.File, filename string) (string, error) {
	return c.UploadImageToFolder(ctx, file, filename, "courses/thumbnails")
}

// CloudinaryImage represents an image in Cloudinary
type CloudinaryImage struct {
	PublicID  string `json:"public_id"`
	URL       string `json:"url"`
	SecureURL string `json:"secure_url"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
	Format    string `json:"format"`
	CreatedAt string `json:"created_at"`
}

// ListImages lists all images from both courses/thumbnails and articles/images folders
func (c *CloudinaryClient) ListImages(ctx context.Context, maxResults int) ([]CloudinaryImage, error) {
	if maxResults <= 0 {
		maxResults = 100 // default - increase to ensure we get all images
	}

	fmt.Printf("Cloudinary: Listing all images, maxResults: %d\n", maxResults)

	// List all images first
	allResult, err := c.cld.Admin.Assets(ctx, admin.AssetsParams{
		AssetType:  "image",
		MaxResults: maxResults,
	})
	if err != nil {
		fmt.Printf("Cloudinary: Failed to list images: %v\n", err)
		return nil, fmt.Errorf("failed to list images: %w", err)
	}

	fmt.Printf("Cloudinary: Total images found: %d\n", len(allResult.Assets))

	images := make([]CloudinaryImage, 0)
	for _, asset := range allResult.Assets {
		// Log every image to see what we're getting
		fmt.Printf("Cloudinary: Asset PublicID: %s\n", asset.PublicID)

		// Filter by folders - check if PublicID starts with courses/thumbnails or articles/images
		isCourseThumbnail := len(asset.PublicID) >= 19 &&
			(asset.PublicID[:19] == "courses/thumbnails/" ||
				(len(asset.PublicID) >= 18 && asset.PublicID[:18] == "courses/thumbnails" &&
					(len(asset.PublicID) == 18 || asset.PublicID[18] == '/')))

		isArticleImage := len(asset.PublicID) >= 15 &&
			(asset.PublicID[:15] == "articles/images/" ||
				(len(asset.PublicID) >= 14 && asset.PublicID[:14] == "articles/images" &&
					(len(asset.PublicID) == 14 || asset.PublicID[14] == '/')))

		if isCourseThumbnail || isArticleImage {
			fmt.Printf("Cloudinary: ✓ Matched - PublicID: %s, URL: %s\n", asset.PublicID, asset.SecureURL)

			createdAt := ""
			if !asset.CreatedAt.IsZero() {
				createdAt = asset.CreatedAt.Format("2006-01-02 15:04:05")
			}

			images = append(images, CloudinaryImage{
				PublicID:  asset.PublicID,
				URL:       asset.URL,
				SecureURL: asset.SecureURL,
				Width:     asset.Width,
				Height:    asset.Height,
				Format:    asset.Format,
				CreatedAt: createdAt,
			})
		}
	}

	fmt.Printf("Cloudinary: Final count - Listed %d images from both folders\n", len(images))
	return images, nil
}
