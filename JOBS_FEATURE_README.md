# Jobs Feature Implementation

## Overview

The Jobs feature provides a comprehensive job listing platform that's accessible only to Pro subscribers. It includes advanced search, filtering, and detailed job information display.

## Features

### 🔍 Advanced Search & Filtering
- **Text Search**: Search by job title, company name, or keywords
- **Category Filter**: Filter by job categories (tech, sales, marketing, design, etc.)
- **Location Filter**: Search by city, state, or remote options
- **Employment Type**: Filter by Full-time, Part-time, Contract, Internship, Freelance
- **Experience Level**: Filter by Entry-level, Mid-level, Senior, Executive
- **Work Arrangement**: Filter by Remote, Hybrid, or On-site positions

### 📋 Job Information
Each job posting includes:
- **Job Title**: Official position name
- **Company Name**: Hiring organization's name
- **Company Overview**: Brief description of the company/brand
- **Location**: City/State or region with remote/hybrid/onsite options
- **Employment Type**: Full-time, Part-time, Contract, Internship, Freelance
- **Salary Range**: Numerical range or exact salary/hourly rate
- **Job Description**: Detailed role description
- **Responsibilities**: Bulleted list of key duties
- **Requirements**: Required and preferred qualifications
- **Application Deadline**: Date by which candidates should apply
- **Application Link**: URL for job applications
- **Education Level**: Required education (Bachelor's, Master's, etc.)
- **Experience Level**: Entry-level, Mid-level, Senior, Executive
- **Category**: Job category (tech, sales, marketing, etc.)

### 🎨 User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Job Cards**: Compact job previews with key information
- **Detailed Modal**: Comprehensive job details in a modal overlay
- **Pagination**: Navigate through multiple pages of job listings
- **Loading States**: Smooth loading indicators and error handling

### 🔒 Pro Subscription Protection
- **Access Control**: Jobs page is only accessible to Pro subscribers
- **Upgrade Prompt**: Non-pro users see an upgrade prompt
- **Middleware**: Backend middleware to enforce subscription requirements

## Technical Implementation

### Backend

#### Models
- **Job Model** (`backend/src/models/Job.ts`): Complete job schema with validation
- **Indexes**: Optimized for search performance

#### Controllers
- **Job Controller** (`backend/src/controllers/jobController.ts`): CRUD operations
- **Search & Filter**: Advanced query building with MongoDB aggregation
- **Pagination**: Efficient pagination with skip/limit
- **Statistics**: Job statistics and category aggregation

#### Routes
- **Public Routes**: View jobs, categories, statistics
- **Protected Routes**: Create, update, delete jobs (Pro only)
- **Middleware**: Authentication and subscription checks

#### Middleware
- **Pro Subscription** (`backend/src/middleware/proSubscription.ts`): Subscription validation
- **Currently Commented**: Ready to enable when payment system is implemented

### Frontend

#### Components
- **JobsPage** (`frontend/src/pages/JobsPage.tsx`): Main jobs listing page
- **JobDetailsModal** (`frontend/src/components/JobDetailsModal.tsx`): Detailed job view
- **Navigation**: Jobs link added to navbar for authenticated users

#### Features
- **State Management**: React hooks for filters, pagination, and modal state
- **API Integration**: Axios-based API calls with error handling
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design with Tailwind CSS

## Database Schema

### Job Collection (`jobs`)
```typescript
{
  _id: ObjectId,
  jobTitle: String (required),
  companyName: String (required),
  companyOverview: String (required),
  location: String (required),
  employmentType: String (enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']),
  salaryRange: String (optional),
  jobDescription: String (required),
  responsibilities: [String] (required),
  requirements: {
    required: [String] (required),
    preferred: [String] (optional)
  },
  applicationDeadline: Date (optional),
  applicationLink: String (required),
  educationLevel: String (optional),
  experienceLevel: String (enum: ['Entry-level', 'Mid-level', 'Senior', 'Executive']),
  category: String (enum: ['tech', 'sales', 'marketing', 'design', 'product', 'operations', 'finance', 'hr', 'other']),
  isRemote: Boolean,
  isHybrid: Boolean,
  isOnsite: Boolean,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public Endpoints
- `GET /api/jobs` - Get all jobs with filtering and pagination
- `GET /api/jobs/categories` - Get all job categories
- `GET /api/jobs/stats` - Get job statistics
- `GET /api/jobs/:id` - Get specific job by ID

### Protected Endpoints (Pro Only)
- `POST /api/jobs` - Create new job posting
- `PUT /api/jobs/:id` - Update job posting
- `DELETE /api/jobs/:id` - Delete job posting

## Setup Instructions

### 1. Database Setup
```bash
# Navigate to backend directory
cd backend

# Run the seed script to populate sample jobs
npm run seed:jobs
```

### 2. Enable Pro Subscription Check
When your payment system is ready, uncomment the subscription check in:
```typescript
// backend/src/middleware/proSubscription.ts
// Uncomment lines 23-27
```

### 3. Add Job Data
Use the API endpoints to add job postings:
```bash
# Example: Add a job via API
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobTitle": "Senior Developer",
    "companyName": "Tech Corp",
    ...
  }'
```

## Sample Job Data

The seed script includes 5 sample jobs covering different categories:
1. **Senior Software Engineer** (Tech, Remote)
2. **Product Marketing Manager** (Marketing, Hybrid)
3. **UX/UI Designer** (Design, Remote)
4. **Sales Development Representative** (Sales, On-site)
5. **Data Scientist** (Tech, Remote)

## Usage

### For Users
1. **Access**: Navigate to `/jobs` (requires Pro subscription)
2. **Search**: Use the search bar to find specific jobs
3. **Filter**: Use advanced filters to narrow down results
4. **View Details**: Click "View Details" to see full job information
5. **Apply**: Click "Apply Now" to go to the external application

### For Administrators
1. **Add Jobs**: Use the API endpoints to add new job postings
2. **Manage Jobs**: Update or delete existing job postings
3. **Monitor**: Use the statistics endpoint to track job metrics

## Future Enhancements

- **Job Alerts**: Email notifications for new matching jobs
- **Application Tracking**: Track job applications within the platform
- **Company Profiles**: Detailed company information pages
- **Job Recommendations**: AI-powered job recommendations
- **Resume Matching**: Match user resumes with job requirements
- **Interview Scheduling**: Integrated interview scheduling system

## Troubleshooting

### Common Issues
1. **Jobs not loading**: Check if the seed script has been run
2. **Pro subscription error**: Ensure the subscription middleware is properly configured
3. **Search not working**: Verify MongoDB text indexes are created
4. **Modal not opening**: Check if JobDetailsModal component is properly imported

### Debug Commands
```bash
# Check if jobs exist in database
mongo resumicai --eval "db.jobs.find().count()"

# Check job categories
mongo resumicai --eval "db.jobs.distinct('category')"

# Test API endpoint
curl http://localhost:5000/api/jobs
```

## Security Considerations

- **Authentication**: All protected endpoints require valid JWT tokens
- **Authorization**: Pro subscription check for job management
- **Input Validation**: All job data is validated on both frontend and backend
- **Rate Limiting**: Consider implementing rate limiting for API endpoints
- **Data Sanitization**: User inputs are sanitized to prevent XSS attacks 