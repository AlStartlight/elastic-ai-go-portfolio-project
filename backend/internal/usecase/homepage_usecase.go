package usecase

import (
	"context"

	"portfolio/internal/domain/homepage"
)

type homepageUsecase struct {
	homepageRepo homepage.Repository
}

func NewHomepageUsecase(homepageRepo homepage.Repository) homepage.Usecase {
	return &homepageUsecase{
		homepageRepo: homepageRepo,
	}
}

func (u *homepageUsecase) GetBySection(ctx context.Context, section string) (*homepage.HomepageContent, error) {
	return u.homepageRepo.GetBySection(ctx, section)
}

func (u *homepageUsecase) GetContentBySection(ctx context.Context, section string) (*homepage.HomepageContent, error) {
	return u.homepageRepo.GetBySection(ctx, section)
}

func (u *homepageUsecase) UpdateContent(ctx context.Context, content *homepage.HomepageContent) error {
	return u.homepageRepo.Update(ctx, content)
}

func (u *homepageUsecase) GetAllTechStacks(ctx context.Context) ([]homepage.TechStack, error) {
	return u.homepageRepo.GetAllTechStacks(ctx)
}

func (u *homepageUsecase) GetTechStackByID(ctx context.Context, id string) (*homepage.TechStack, error) {
	return u.homepageRepo.GetTechStackByID(ctx, id)
}

func (u *homepageUsecase) CreateTechStack(ctx context.Context, tech *homepage.TechStack) error {
	return u.homepageRepo.CreateTechStack(ctx, tech)
}

func (u *homepageUsecase) UpdateTechStack(ctx context.Context, tech *homepage.TechStack) error {
	return u.homepageRepo.UpdateTechStack(ctx, tech)
}

func (u *homepageUsecase) DeleteTechStack(ctx context.Context, id string) error {
	return u.homepageRepo.DeleteTechStack(ctx, id)
}
