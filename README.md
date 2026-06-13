# Moody - Mood Tracking Platform with VPS-Based Deployment

A comprehensive mood tracking platform designed for mental health and wellbeing management with integrated psychological insights and VPS-based deployment capabilities.

<img width="1118" height="624" alt="Image" src="https://github.com/user-attachments/assets/bace1b67-1c3c-4121-b88d-11cd5b72a09a" />

## Features

- **Mood Tracking**: Track daily moods with detailed insights
- **Psychological Support**: Access expert psychological content and guidance
- **User Dashboard**: Personalized dashboard for mood history and analytics
- **Psychologist Dashboard**: Dedicated interface for mental health professionals
- **Role-Based Access**: Admin, Psychologist, and User roles with secure authentication
- **Cloud Deployment**: Ready for VPS deployment with Docker support
- **Analytics**: Track mood patterns and trends over time

## Tech Stack

### Frontend
- **HTML5** - Markup structure
- **CSS3** - Styling and responsive design
- **JavaScript (Vanilla)** - Client-side logic
- **API Integration** - RESTful API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication

### Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **VPS** - Virtual Private Server hosting

## Project Structure

```
Moody/
├── frontend/                 # Frontend application
│   ├── index.html           # Login page
│   ├── dashboard-user.html  # User dashboard
│   ├── dashboard-psych.html # Psychologist dashboard
│   ├── dashboard-admin.html # Admin dashboard
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   └── js/
│       ├── auth.js          # Authentication logic
│       ├── api.js           # API communication
│       └── dashboard.js     # Dashboard functionality
├── backend/                  # Backend server
│   ├── server.js            # Express server setup
│   ├── database.js          # Database initialization
│   ├── package.json         # Backend dependencies
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   └── routes/
│       ├── auth.js          # Authentication routes
│       ├── moods.js         # Mood tracking routes
│       ├── quote.js         # Motivational quotes routes
│       ├── content.js       # Content management routes
│       └── admin.js         # Admin routes
├── uploads/                  # User uploads directory
│   └── logo/                # Logo storage
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
├── package.json             # Root package.json
└── .gitignore              # Git ignore rules
```

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Docker & Docker Compose (for containerized deployment)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bellechillguy/Mood-Tracking-Platform-with-VPS-Based-Deployment--Moody-.git
   cd Mood-Tracking-Platform-with-VPS-Based-Deployment--Moody-
   ```

2. **Install dependencies**
   ```bash
   npm run install:backend
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open `http://localhost:3000` in your browser

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000` (or configured port)

## Usage

### User Workflow
1. Register or login to your account
2. Navigate to your dashboard
3. Log your current mood and add notes
4. View mood history and patterns
5. Access psychological content and resources

### Psychologist Workflow
1. Login with psychologist credentials
2. View client mood data and trends
3. Provide insights and recommendations
4. Manage content and resources

### Admin Workflow
1. Login with admin credentials
2. Manage user accounts and roles
3. Oversee system configuration
4. Monitor platform activity

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Mood Tracking
- `GET /api/moods` - Get user's mood history
- `POST /api/moods` - Log a new mood
- `GET /api/moods/:id` - Get specific mood entry
- `PUT /api/moods/:id` - Update mood entry
- `DELETE /api/moods/:id` - Delete mood entry

### Content
- `GET /api/content` - Get available content
- `POST /api/content` - Create content (admin)

### Quotes
- `GET /api/quote` - Get motivational quote

### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/analytics` - View analytics

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
DATABASE_URL=./moody.db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Deployment to VPS

1. **Connect to your VPS**
   ```bash
   ssh user@your_vps_ip
   ```

2. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd Mood-Tracking-Platform-with-VPS-Based-Deployment--Moody-
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build and run with Docker**
   ```bash
   docker-compose up -d
   ```

5. **Configure nginx/reverse proxy** (optional but recommended)
   - Set up SSL certificates with Let's Encrypt
   - Configure reverse proxy to forward requests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, open an issue on GitHub.

## Acknowledgments

- Thanks to all contributors
- Inspired by mental health awareness initiatives
- Built with care for user wellbeing

---

**Made with ❤️ for mental health and wellbeing**
