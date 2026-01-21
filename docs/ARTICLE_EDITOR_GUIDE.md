# Article Editor with EditorJS

Sistem editor artikel yang modern menggunakan EditorJS dengan berbagai plugin.

## Features

### ✅ EditorJS Plugins Installed
- **@editorjs/editorjs** (v2.30.8) - Core editor
- **@editorjs/header** (v2.8.8) - Headers (H1-H6)
- **@editorjs/paragraph** (v2.11.7) - Paragraphs
- **@editorjs/list** (v2.0.8) - Ordered & Unordered Lists
- **@editorjs/code** (v2.9.3) - Code blocks
- **@editorjs/image** (v2.10.2) - Image upload & URL

### 🎨 Editor Features
- Rich text editing dengan toolbar inline
- Image upload dengan Cloudinary integration
- Code syntax highlighting
- Headers dengan 6 levels (H1-H6)
- Bullet & numbered lists
- Auto-save content sebagai JSON
- Dark theme untuk admin dashboard

### 🛠️ Components

#### 1. EditorJS Component
**Location:** `/frontend/src/components/EditorJS.tsx`

Reusable wrapper untuk EditorJS dengan:
- Type-safe dengan TypeScript
- Auto-initialization & cleanup
- Image upload dengan authorization
- Custom styling untuk dark theme

#### 2. Article Editor Page
**Location:** `/frontend/src/pages/Admin/ArticleEditor.tsx`

Full featured article editor dengan:
- Title & excerpt inputs
- Category selection
- Tags management
- Featured & published toggles
- Draft & publish buttons
- Edit existing articles

#### 3. Manage Articles
**Location:** `/frontend/src/pages/Admin/ManageArticles.tsx`

List view untuk semua articles dengan:
- Create new article button
- Edit button (navigasi ke editor)
- Toggle featured status
- Delete functionality
- View article statistics

## Routes

### Frontend Routes
```
/admin/articles           - List all articles
/admin/articles/new       - Create new article
/admin/articles/edit/:id  - Edit existing article
```

### Backend API Endpoints
```
GET    /api/public/articles              - Get all published articles
GET    /api/public/articles/featured-list - Get featured articles
GET    /api/public/articles/:slug        - Get article by slug

POST   /api/admin/articles               - Create new article
PUT    /api/admin/articles/:id           - Update article
DELETE /api/admin/articles/:id           - Delete article
POST   /api/admin/upload/image           - Upload image for editor
```

## Usage

### Creating New Article

1. Login ke admin dashboard
2. Navigate ke **My Key Notes** → `/admin/articles`
3. Click **Create New Article** button
4. Fill in:
   - Title (required)
   - Excerpt (required)
   - Category (required)
   - Content menggunakan EditorJS
   - Tags (optional)
   - Settings: Featured & Published checkboxes

5. Click **Save as Draft** atau **Publish Article**

### Editing Existing Article

1. Di halaman Manage Articles
2. Click **Edit** button (✏️ icon) pada article
3. Edit content
4. Click **Update Article**

### Using EditorJS

#### Available Tools:
- **Header**: Click "+" → Select Header → Choose level (H1-H6)
- **Paragraph**: Default tool, just start typing
- **List**: Click "+" → Select List → Choose ordered/unordered
- **Code**: Click "+" → Select Code → Paste code snippet
- **Image**: Click "+" → Select Image → Upload file atau paste URL

#### Keyboard Shortcuts:
- `Tab` - Indent list item
- `Shift + Tab` - Outdent list item
- `Enter` - Create new block
- `Backspace` - Delete block (when empty)

## Content Structure

Articles disimpan dalam format EditorJS JSON:

```json
{
  "time": 1642534800000,
  "blocks": [
    {
      "type": "header",
      "data": {
        "text": "Article Title",
        "level": 2
      }
    },
    {
      "type": "paragraph",
      "data": {
        "text": "Article content goes here..."
      }
    },
    {
      "type": "list",
      "data": {
        "style": "unordered",
        "items": ["Item 1", "Item 2"]
      }
    },
    {
      "type": "code",
      "data": {
        "code": "console.log('Hello World');"
      }
    },
    {
      "type": "image",
      "data": {
        "file": {
          "url": "https://example.com/image.jpg"
        },
        "caption": "Image caption"
      }
    }
  ],
  "version": "2.30.8"
}
```

## Styling

Custom dark theme styles untuk EditorJS tersedia di:
**Location:** `/frontend/src/styles/editorjs.css`

Includes styling untuk:
- Editor container
- All tools (header, paragraph, list, code, image)
- Toolbars (inline, settings, conversion)
- Popover menus
- Block selections
- Dark theme colors

## Backend Integration

### Image Upload Handler
**Location:** `/backend/internal/delivery/http/article_handler.go`

Method: `UploadImage()`
- Accepts multipart form data
- Uploads ke Cloudinary
- Returns URL dalam format EditorJS

### Article CRUD
- Create: Saves EditorJS JSON as string in database
- Read: Parses JSON dan returns structured data
- Update: Updates article dengan new EditorJS content
- Delete: Removes article dari database

## Troubleshooting

### Editor tidak muncul
- Check console untuk errors
- Pastikan EditorJS packages terinstall
- Verify `editorjs.css` di-import di `main.tsx`

### Image upload gagal
- Check Cloudinary configuration di `.env`
- Verify JWT token valid
- Check file size limits
- Verify backend `/api/admin/upload/image` endpoint

### Content tidak tersimpan
- Check network tab untuk API errors
- Verify article memiliki title, excerpt, category
- Check EditorJS blocks tidak kosong
- Verify JWT authorization header

## Future Enhancements

Possible additions:
- [ ] Quote block
- [ ] Table block
- [ ] Embed (YouTube, Twitter, etc)
- [ ] Delimiter
- [ ] Warning/Alert blocks
- [ ] Checklist
- [ ] Link tool
- [ ] Inline code
- [ ] Bold/Italic formatting
- [ ] Text alignment
- [ ] Color picker
- [ ] Font size options
- [ ] Export to Markdown
- [ ] Preview mode
- [ ] Auto-save drafts
- [ ] Version history
- [ ] Collaborative editing

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Editor**: EditorJS v2.30.8
- **Styling**: TailwindCSS + Custom CSS
- **Backend**: Go + Gin
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **Auth**: JWT tokens
