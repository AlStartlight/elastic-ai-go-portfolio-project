// Custom EditorJS Image Tool with Cloudinary Gallery Support
import { articleApi } from '../services/api-service';

interface CloudinaryImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
}

interface ImageToolData {
  url: string;
  caption?: string;
  withBorder?: boolean;
  withBackground?: boolean;
  stretched?: boolean;
}

interface ImageToolConfig {
  endpoints?: {
    byFile?: string;
    byUrl?: string;
  };
  field?: string;
  types?: string;
  additionalRequestHeaders?: Record<string, string>;
  captionPlaceholder?: string;
  buttonContent?: string;
  uploader?: {
    uploadByFile?: (file: File) => Promise<{ success: number; file: { url: string } }>;
  };
}

class CloudinaryImageTool {
  private api: any;
  private readOnly: boolean;
  private data: ImageToolData;
  private wrapper: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private config: ImageToolConfig;

  static get isInline() {
    return false;
  }

  static get pasteConfig() {
    return {
      tags: ['img'],
      patterns: {
        image: /https?:\/\/.*\.(png|jpg|jpeg|gif|webp|svg)$/i,
      },
      files: {
        mimeTypes: ['image/*'],
      },
    };
  }

  constructor({ data, api, readOnly, config }: any) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config || {};
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      withBorder: data.withBorder !== undefined ? data.withBorder : false,
      withBackground: data.withBackground !== undefined ? data.withBackground : false,
      stretched: data.stretched !== undefined ? data.stretched : false,
    };
  }

  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('cdx-block', 'image-tool');

    if (this.data.url) {
      this.renderImage();
    } else {
      this.renderUploader();
    }

    return this.wrapper;
  }

  renderImage() {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = `
      <div class="image-tool__image-container">
        <img src="${this.data.url}" alt="${this.data.caption}" class="image-tool__image" />
      </div>
      <div class="image-tool__caption">
        <input 
          type="text" 
          placeholder="Image caption..." 
          value="${this.data.caption || ''}"
          class="image-tool__caption-input"
          ${this.readOnly ? 'disabled' : ''}
        />
      </div>
    `;

    const captionInput = this.wrapper.querySelector('.image-tool__caption-input') as HTMLInputElement;
    if (captionInput) {
      captionInput.addEventListener('input', (e) => {
        this.data.caption = (e.target as HTMLInputElement).value;
      });
    }
  }

  renderUploader() {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = `
      <div class="image-tool__uploader">
        <div class="image-tool__upload-button-group">
          <button class="image-tool__button upload-file-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload from Computer
          </button>
          <button class="image-tool__button browse-gallery-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Browse Cloudinary Gallery
          </button>
        </div>
        <input type="file" accept="image/*" class="image-tool__file-input" style="display: none;" />
      </div>
    `;

    const uploadBtn = this.wrapper.querySelector('.upload-file-btn');
    const galleryBtn = this.wrapper.querySelector('.browse-gallery-btn');
    const fileInput = this.wrapper.querySelector('.image-tool__file-input') as HTMLInputElement;

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          await this.uploadFile(file);
        }
      });
    }

    if (galleryBtn) {
      galleryBtn.addEventListener('click', () => {
        this.openCloudinaryGallery();
      });
    }
  }

  async uploadFile(file: File) {
    if (!this.wrapper) return;

    // Show loading state
    this.wrapper.innerHTML = `
      <div class="image-tool__loading">
        <svg class="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Uploading image...</p>
      </div>
    `;

    try {
      const result = await articleApi.uploadImage(file);
      
      // Check if result has the expected structure
      if (!result || !result.file || !result.file.url) {
        throw new Error('Invalid response from server');
      }
      
      this.data.url = result.file.url;
      this.data.caption = file.name;
      this.renderImage();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error.message || 'Failed to upload image';
      this.wrapper.innerHTML = `
        <div class="image-tool__error">
          <p>${errorMessage}</p>
          <button class="image-tool__retry-button">Retry</button>
        </div>
      `;

      const retryBtn = this.wrapper.querySelector('.image-tool__retry-button');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.renderUploader();
        });
      }
    }
  }

  async openCloudinaryGallery() {
    try {
      // Create modal overlay
      this.modal = document.createElement('div');
      this.modal.className = 'cloudinary-gallery-modal';
      this.modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h2>Select from Cloudinary Gallery</h2>
              <p class="loading-text">Loading images...</p>
            </div>
            <button class="modal-close-btn">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="gallery-loading">
              <svg class="animate-spin h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(this.modal);

      // Close button
      const closeBtn = this.modal.querySelector('.modal-close-btn');
      const overlay = this.modal.querySelector('.modal-overlay');
      
      const closeModal = () => {
        if (this.modal) {
          document.body.removeChild(this.modal);
          this.modal = null;
        }
      };

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (overlay) overlay.addEventListener('click', closeModal);

      // Load images from Cloudinary
      const result = await articleApi.listImages(100);
      const images = result.images || [];

      const modalBody = this.modal.querySelector('.modal-body');
      const loadingText = this.modal.querySelector('.loading-text');
      
      if (loadingText) {
        loadingText.textContent = `${images.length} images available`;
      }

      if (modalBody) {
        if (images.length === 0) {
          modalBody.innerHTML = `
            <div class="gallery-empty">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No images found in Cloudinary</p>
              <p class="text-sm">Upload some images first or check your Cloudinary configuration</p>
            </div>
          `;
        } else {
          modalBody.innerHTML = `
            <div class="gallery-grid">
              ${images.map((img: CloudinaryImage, index: number) => `
                <button class="gallery-item" data-index="${index}" data-url="${img.secureUrl}" data-name="${img.publicId.split('/').pop()}">
                  <img src="${img.secureUrl}" alt="${img.publicId}" loading="lazy" />
                  <div class="gallery-item-overlay">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p>Click to Insert</p>
                  </div>
                  <div class="gallery-item-info">
                    <p class="gallery-item-name">${img.publicId.split('/').pop()}</p>
                    <p class="gallery-item-size">${img.width} × ${img.height}</p>
                  </div>
                </button>
              `).join('')}
            </div>
          `;

          // Add click handlers to gallery items
          const galleryItems = modalBody.querySelectorAll('.gallery-item');
          galleryItems.forEach((item) => {
            item.addEventListener('click', () => {
              const url = item.getAttribute('data-url');
              const name = item.getAttribute('data-name');
              if (url && name) {
                this.data.url = url;
                this.data.caption = name;
                this.renderImage();
                closeModal();
              }
            });
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading Cloudinary gallery:', error);
      const errorMessage = error.message || 'Failed to load images from Cloudinary';
      
      if (this.modal) {
        const modalBody = this.modal.querySelector('.modal-body');
        if (modalBody) {
          modalBody.innerHTML = `
            <div class="gallery-error">
              <p>${errorMessage}</p>
              <p class="text-sm">Please check your authentication and Cloudinary configuration</p>
              <button class="retry-btn">Retry</button>
            </div>
          `;

          const retryBtn = modalBody.querySelector('.retry-btn');
          if (retryBtn) {
            retryBtn.addEventListener('click', () => {
              if (this.modal) {
                document.body.removeChild(this.modal);
                this.modal = null;
              }
              this.openCloudinaryGallery();
            });
          }
        }
      }
    }
  }

  save() {
    return {
      url: this.data.url,
      caption: this.data.caption,
      withBorder: this.data.withBorder,
      withBackground: this.data.withBackground,
      stretched: this.data.stretched,
    };
  }

  validate(savedData: ImageToolData) {
    if (!savedData.url || !savedData.url.trim()) {
      return false;
    }
    return true;
  }

  static get sanitize() {
    return {
      url: {},
      caption: {
        br: true,
      },
    };
  }

  async onPaste(event: any) {
    switch (event.type) {
      case 'tag': {
        const img = event.detail.data;
        this.data.url = img.src;
        if (this.wrapper) {
          this.renderImage();
        }
        break;
      }

      case 'pattern': {
        this.data.url = event.detail.data;
        if (this.wrapper) {
          this.renderImage();
        }
        break;
      }

      case 'file': {
        await this.uploadFile(event.detail.file);
        break;
      }
    }
  }

  static get enableLineBreaks() {
    return true;
  }
}

export default CloudinaryImageTool;
