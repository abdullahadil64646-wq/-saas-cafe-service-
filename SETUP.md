# 🚀 SaaS Cafe Service - Complete Setup Guide

## 🎯 Overview

This is a comprehensive SaaS platform designed to help cafes automate their social media presence, generate leads, and manage marketing campaigns with AI-powered tools.

## ✨ Key Features

### 🤖 AI-Powered Social Media Management
- **Smart Content Generation**: AI creates engaging posts with different tones and themes
- **Bulk Scheduling**: Schedule multiple posts across platforms
- **Hashtag Research**: Find trending and effective hashtags
- **Analytics Dashboard**: Track engagement and performance

### 👥 Lead Management (Admin Only)
- **Google Maps Scraping**: Automatically find potential cafe clients
- **Contact Management**: Track leads through sales pipeline
- **Conversion Analytics**: Monitor lead-to-customer conversion rates
- **Bulk Operations**: Import/export leads efficiently

### 📊 Marketing Campaigns
- **Multi-Platform Campaigns**: Run coordinated campaigns across social media
- **Budget Tracking**: Monitor spend and ROI
- **Zapier Integration**: Connect to hundreds of automation tools
- **Template Library**: Quick-start campaign templates

### 📈 Advanced Analytics
- **Performance Metrics**: Track posts, engagement, and growth
- **ROI Analysis**: Measure campaign effectiveness
- **Trend Analysis**: Identify patterns and opportunities
- **Custom Reports**: Generate detailed analytics reports

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Configure your .env file**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/saas_cafe_service

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secure_jwt_secret_here

# Environment
NODE_ENV=development

# Server
PORT=5000

# Client URL
CLIENT_URL=http://localhost:3000

# Optional: External API Keys
OPENAI_API_KEY=your_openai_api_key
ZAPIER_WEBHOOK_URL=your_zapier_webhook_url
STRIPE_SECRET_KEY=your_stripe_secret_key
```

5. **Start the backend server**
```bash
npm run dev
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🎮 Usage Guide

### For Cafe Owners

1. **Registration & Setup**
   - Register your cafe account
   - Complete your profile with business details
   - Choose a subscription plan

2. **Social Media Management**
   - Navigate to "Social Media" section
   - Use AI to generate engaging content
   - Schedule posts across multiple platforms
   - Research effective hashtags
   - Monitor analytics and engagement

3. **Campaign Management**
   - Create marketing campaigns
   - Set budget and target audience
   - Use automation for consistent posting
   - Track ROI and performance

### For Administrators

1. **Lead Management**
   - Access "Leads" section (admin only)
   - Use Google Maps scraping to find prospects
   - Manage lead pipeline and conversions
   - Generate lead reports

2. **System Administration**
   - Monitor all cafe accounts
   - Manage subscription plans
   - View system-wide analytics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new cafe
- `POST /api/auth/login` - Login user

### Social Media
- `GET /api/social/posts` - Get all posts
- `POST /api/social/generate-advanced-content` - AI content generation
- `POST /api/social/bulk-schedule` - Bulk schedule posts
- `GET /api/social/analytics` - Social media analytics

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `POST /api/campaigns/:id/start` - Start campaign
- `POST /api/campaigns/:id/pause` - Pause campaign

### Lead Management (Admin)
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `POST /api/leads/scrape/google-maps` - Scrape leads
- `GET /api/leads/stats/overview` - Lead statistics

### Hashtag Research
- `GET /api/hashtags` - Get hashtag research
- `POST /api/hashtags/research` - Research new hashtags
- `GET /api/hashtags/recommendations` - Get recommendations

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/detailed` - Detailed analytics
- `POST /api/analytics/report` - Generate reports

## 🎨 Customization

### Adding New Social Media Platforms

1. **Update Backend Models**
   - Add platform to `socialpost.js` enum
   - Update API endpoints in `socialmedia.js`

2. **Update Frontend Components**
   - Add platform icons and colors
   - Update platform selection forms

### Extending AI Content Generation

1. **Enhance Backend Logic**
   - Modify `generateAdvancedAIContent` function
   - Add new content templates and themes

2. **Add New Content Types**
   - Extend content type options
   - Add platform-specific optimizations

## 🔒 Security Features

- JWT-based authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- MongoDB injection protection

## 📱 Mobile Responsiveness

The platform is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen sizes and orientations

## 🚀 Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

### Environment Variables for Production

Make sure to set secure values for:
- `JWT_SECRET` - Use a strong, unique secret
- `MONGODB_URI` - Your production MongoDB connection
- `NODE_ENV=production`
- API keys for external services

### Deployment Platforms

- **Heroku**: Easy deployment with git integration
- **Digital Ocean**: App Platform or Droplets
- **AWS**: EC2, Elastic Beanstalk, or Lambda
- **Vercel**: For frontend deployment
- **Netlify**: Alternative frontend hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review API endpoints and examples

## 🔄 Future Enhancements

- Real social media API integrations
- Advanced AI models for content generation
- Mobile app development
- White-label solutions
- Advanced analytics and reporting
- Multi-language support