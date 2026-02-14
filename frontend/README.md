# YouTube Clip Maker - Frontend

A modern, professional frontend for the YouTube Clip Maker application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Clean Landing Page**: YouTube URL input with validation
- **Real-time Progress Tracking**: Shows downloading → transcribing → analyzing → cutting steps
- **Clip Preview Grid**: Thumbnails with hover previews, names, durations, and download buttons
- **Batch Downloads**: Download all clips at once as a ZIP file
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Theme**: Professional SaaS-style dark UI
- **Error Handling**: Comprehensive error states and retry mechanisms
- **Loading States**: Smooth UX with loading indicators throughout

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Modern React Hooks** for state management

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Setup

1. **Clone and navigate to the frontend directory**:
   ```bash
   cd /path/to/youtube-clip-maker/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set your API base URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## API Integration

The frontend expects the following API endpoints:

### POST `/api/process`
Start processing a YouTube video:
```json
{
  "youtubeUrl": "https://youtube.com/watch?v=..."
}
```

Response:
```json
{
  "success": true,
  "jobId": "unique-job-id"
}
```

### GET `/api/status/{jobId}`
Get processing status and results:
```json
{
  "job": {
    "id": "job-id",
    "youtubeUrl": "...",
    "status": "completed",
    "progress": 100,
    "currentStep": "cutting",
    "clips": [
      {
        "id": "clip-id",
        "name": "Clip title",
        "duration": 30,
        "startTime": 120,
        "endTime": 150,
        "thumbnail": "https://...",
        "videoUrl": "https://...",
        "downloadUrl": "https://..."
      }
    ]
  }
}
```

### GET `/api/download/{clipId}`
Download individual clip (returns video file)

### GET `/api/download/batch/{jobId}`
Download all clips as ZIP (returns zip file)

## Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from project root**:
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**:
   - `NEXT_PUBLIC_API_BASE_URL`: Your production API URL

### Vercel Requirements

- **Node.js Version**: 18.x or higher
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm run start
   ```

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t youtube-clip-maker-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=your-api-url youtube-clip-maker-frontend
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── UrlInput.tsx    # YouTube URL input form
│   ├── ProgressIndicator.tsx # Processing steps display
│   ├── ClipCard.tsx    # Individual clip preview
│   └── ClipGrid.tsx    # Clips grid with controls
├── lib/                # Utilities
│   ├── api.ts          # API client functions
│   └── utils.ts        # Helper functions
└── types/              # TypeScript definitions
    └── index.ts        # Shared type definitions
```

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Edit `src/app/globals.css` for global styles
- Component styles use Tailwind classes

### API Configuration
- Update API endpoints in `src/lib/api.ts`
- Modify polling intervals and retry logic as needed

### UI Components
- All components are modular and customizable
- Icons from Lucide React can be easily swapped
- Animations and transitions are configurable

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Optimized bundle size with tree shaking
- Image optimization with Next.js Image component
- Lazy loading for video previews
- Efficient re-renders with React hooks

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Check `NEXT_PUBLIC_API_BASE_URL` in environment variables
   - Ensure API server is running and accessible
   - Verify CORS settings on API server

2. **Build Failures**:
   - Clear Next.js cache: `rm -rf .next`
   - Delete node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **Video Preview Issues**:
   - Ensure video URLs are accessible
   - Check CORS headers for video files
   - Verify browser video format support

### Development Tips

- Use React DevTools for debugging
- Enable verbose logging with `NEXT_DEBUG=1`
- Test API endpoints with curl or Postman
- Use browser DevTools Network tab for API debugging

## Contributing

1. Follow TypeScript strict mode
2. Use ESLint configuration provided
3. Add proper error handling
4. Write descriptive commit messages
5. Test on multiple screen sizes

## License

This project is part of the YouTube Clip Maker application.