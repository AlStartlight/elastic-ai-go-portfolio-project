package repository

import (
	"context"
	"database/sql"
	"encoding/json"

	"portfolio/internal/domain/homepage"
)

type homepageRepository struct {
	db *sql.DB
}

func NewHomepageRepository(db *sql.DB) homepage.Repository {
	return &homepageRepository{db: db}
}

func (r *homepageRepository) GetBySection(ctx context.Context, section string) (*homepage.HomepageContent, error) {
	query := `
		SELECT id, section, title, subtitle, description, image_url,
			   cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link,
			   metadata, is_active, created_at, updated_at
		FROM homepage_content
		WHERE section = $1 AND is_active = true
	`

	var content homepage.HomepageContent
	var metadataJSON []byte
	var subtitle, description, imageURL sql.NullString
	var ctaPrimaryText, ctaPrimaryLink, ctaSecondaryText, ctaSecondaryLink sql.NullString

	err := r.db.QueryRowContext(ctx, query, section).Scan(
		&content.ID,
		&content.Section,
		&content.Title,
		&subtitle,
		&description,
		&imageURL,
		&ctaPrimaryText,
		&ctaPrimaryLink,
		&ctaSecondaryText,
		&ctaSecondaryLink,
		&metadataJSON,
		&content.IsActive,
		&content.CreatedAt,
		&content.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	// Convert NullStrings to regular strings
	if subtitle.Valid {
		content.Subtitle = subtitle.String
	}
	if description.Valid {
		content.Description = description.String
	}
	if imageURL.Valid {
		content.ImageURL = imageURL.String
	}
	if ctaPrimaryText.Valid {
		content.CtaPrimaryText = ctaPrimaryText.String
	}
	if ctaPrimaryLink.Valid {
		content.CtaPrimaryLink = ctaPrimaryLink.String
	}
	if ctaSecondaryText.Valid {
		content.CtaSecondaryText = ctaSecondaryText.String
	}
	if ctaSecondaryLink.Valid {
		content.CtaSecondaryLink = ctaSecondaryLink.String
	}

	if len(metadataJSON) > 0 {
		if err := json.Unmarshal(metadataJSON, &content.Metadata); err != nil {
			content.Metadata = make(map[string]interface{})
		}
	} else {
		content.Metadata = make(map[string]interface{})
	}

	return &content, nil
}

func (r *homepageRepository) Update(ctx context.Context, content *homepage.HomepageContent) error {
	metadataJSON, err := json.Marshal(content.Metadata)
	if err != nil {
		return err
	}

	query := `
		UPDATE homepage_content 
		SET title = $1, subtitle = $2, description = $3, image_url = $4,
			cta_primary_text = $5, cta_primary_link = $6, 
			cta_secondary_text = $7, cta_secondary_link = $8,
			metadata = $9, updated_at = CURRENT_TIMESTAMP
		WHERE section = $10
	`

	_, err = r.db.ExecContext(ctx, query,
		content.Title,
		content.Subtitle,
		content.Description,
		content.ImageURL,
		content.CtaPrimaryText,
		content.CtaPrimaryLink,
		content.CtaSecondaryText,
		content.CtaSecondaryLink,
		metadataJSON,
		content.Section,
	)

	return err
}

func (r *homepageRepository) GetAllTechStacks(ctx context.Context) ([]homepage.TechStack, error) {
	query := `
		SELECT id, title, description, icon, category, display_order, is_active, created_at, updated_at
		FROM tech_stacks
		WHERE is_active = true
		ORDER BY display_order ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stacks []homepage.TechStack
	for rows.Next() {
		var stack homepage.TechStack
		err := rows.Scan(
			&stack.ID,
			&stack.Title,
			&stack.Description,
			&stack.Icon,
			&stack.Category,
			&stack.DisplayOrder,
			&stack.IsActive,
			&stack.CreatedAt,
			&stack.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		stacks = append(stacks, stack)
	}

	return stacks, nil
}

func (r *homepageRepository) GetTechStackByID(ctx context.Context, id string) (*homepage.TechStack, error) {
	query := `
		SELECT id, title, description, icon, category, display_order, is_active, created_at, updated_at
		FROM tech_stacks
		WHERE id = $1
	`

	var stack homepage.TechStack
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&stack.ID,
		&stack.Title,
		&stack.Description,
		&stack.Icon,
		&stack.Category,
		&stack.DisplayOrder,
		&stack.IsActive,
		&stack.CreatedAt,
		&stack.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &stack, nil
}

func (r *homepageRepository) CreateTechStack(ctx context.Context, tech *homepage.TechStack) error {
	query := `
		INSERT INTO tech_stacks (title, description, icon, category, display_order, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowContext(ctx, query,
		tech.Title,
		tech.Description,
		tech.Icon,
		tech.Category,
		tech.DisplayOrder,
		tech.IsActive,
	).Scan(&tech.ID, &tech.CreatedAt, &tech.UpdatedAt)
}

func (r *homepageRepository) UpdateTechStack(ctx context.Context, tech *homepage.TechStack) error {
	query := `
		UPDATE tech_stacks 
		SET title = $1, description = $2, icon = $3, category = $4, 
			display_order = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id = $7
	`

	_, err := r.db.ExecContext(ctx, query,
		tech.Title,
		tech.Description,
		tech.Icon,
		tech.Category,
		tech.DisplayOrder,
		tech.IsActive,
		tech.ID,
	)

	return err
}

func (r *homepageRepository) DeleteTechStack(ctx context.Context, id string) error {
	query := `UPDATE tech_stacks SET is_active = false WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
