# Tablextract

Tablextract is a web application that uses AI to extract tables from images, PDFs, and other document formats. It provides an easy way to convert visual table data into structured formats like CSV, Excel, or JSON.

## Features

- Extract tables from images, PDFs, Excel, Word, and more
- AI-powered table recognition using Google Gemini 2.0 Flash API
- Export to multiple formats (CSV, Excel, clipboard)
- User accounts to save and manage extractions
- Subscription-based pricing with different tiers

## Tech Stack

- **Frontend/Backend**: SvelteKit with TypeScript
- **Database/Auth**: Supabase
- **Hosting**: Netlify
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.0 Flash API

## Development Status

The application is being developed in phases:

### Phase 1: Core Infrastructure ✅
- SvelteKit project setup with TypeScript
- Supabase integration for authentication and database
- Tailwind CSS configuration
- Basic project structure and UI components

### Phase 2: MVP Features ✅
- File upload interface with drag-and-drop functionality
- Table extraction using Gemini 2.0 Flash API
- Export functionality (CSV, Excel, clipboard)
- User authentication (login, signup, account management)
- Storage of extraction results with history view

### Phase 3: Enhanced Features (Upcoming)
- Advanced export options
- Subscription management
- Usage limiting system
- UI/UX improvements

### Phase 4: Optimization and Scaling (Upcoming)
- Performance optimizations
- Error handling improvements
- Analytics integration
- Advanced user management

## Development

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Supabase account
- Google AI API key (for Gemini)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tablextract.git
   cd tablextract
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the values in `.env` with your actual credentials

4. Supabase Setup:
   - Create a new project in [Supabase](https://supabase.com)
   - Get your project URL and anon key from the API settings
   - Run the database setup SQL from `supabase/schema.sql` in the SQL editor
   - Configure authentication providers in the Auth settings
   - Set up storage buckets for file uploads
   - Configure Row Level Security (RLS) policies

5. Gemini API Setup:
   - Create a Google Cloud account if you don't have one
   - Enable the Gemini API in your Google Cloud project
   - Create an API key in the Google Cloud Console
   - Add the API key to your `.env` file as `PUBLIC_GEMINI_API_KEY`

6. Start the development server:
   ```bash
   npm run dev
   ```

### Building

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Deployment

The application is configured for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
3. Add all environment variables from `.env` to Netlify's environment variables
4. Deploy the site

## Project Structure

```
tablextract/
├── src/                  # Source code
│   ├── lib/              # Library code
│   │   ├── components/   # UI components
│   │   ├── services/     # External service integrations
│   │   ├── stores/       # Svelte stores
│   │   └── utils/        # Utility functions
│   ├── routes/           # SvelteKit routes
│   └── app.html          # HTML template
├── static/               # Static assets
├── supabase/             # Supabase configuration
├── tests/                # Test files
└── ...                   # Configuration files
```

## Using the Application

### Extracting Tables

1. Log in to your account or sign up for a new one
2. Navigate to the Dashboard
3. Choose between file upload or clipboard input
4. Upload an image or document containing a table, or paste table content
5. Add optional extraction hints to improve accuracy
6. Click "Extract Table" to process the data
7. View the extracted table and export it in your preferred format

### Managing Extractions

1. Navigate to the History tab in the Dashboard
2. View your past extractions with metadata
3. Click on any extraction to view the extracted table
4. Export or copy the data as needed

## Documentation

For detailed documentation on components and API, see the [docs](docs/) directory.

## License

[MIT](LICENSE)
