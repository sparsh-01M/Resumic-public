import { User as AuthUser } from '../contexts/AuthContext';
import { ParsedResumeData } from './gemini';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    return {
      error: data.message || 'Something went wrong',
    };
  }

  return { data };
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ResumeUploadResponse {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  atsScore?: number;
}

interface ResumeHistoryItem {
  id: string;
  name: string;
  originalName: string;
  url: string;
  atsScore?: number;
  uploadedAt: string;
  lastAccessed?: string;
  fileSize: number;
  fileType: string;
}

interface ResumeHistoryResponse {
  success: boolean;
  data: ResumeHistoryItem[];
}

interface RegisterResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface GitHubAuthUrlResponse {
  url: string;
}

interface GitHubProfileResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
    url: string;
  };
}

interface LinkedInProfileResponse {
  success: boolean;
  message: string;
}

interface LinkedInData {
  profileUrl: string;
  name: string;
  headline: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  updatedAt: string;
}

export interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    subscription?: {
      plan: 'free' | 'pro' | 'teams';
      status: 'active' | 'inactive';
    };
    githubProfile?: {
      username: string;
      url: string;
      connectedAt: string;
    };
    githubConnected: boolean;
    linkedInProfile?: string;
    linkedInLastUpdated?: string;
    linkedInConnected?: boolean;
    transformedResume?: {
      name: string;
      email: string;
      phone: string;
      location: string;
      website: string;
      linkedin: string;
      github: string;
      education: Array<{
        institution: string;
        degree: string;
        startDate: string;
        endDate: string;
        gpa?: string;
        coursework?: string;
      }>;
      experience: Array<{
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        highlights: string[];
      }>;
      projects: Array<{
        name: string;
        date?: string;
        link?: string;
        description: string[];
        technologies?: string;
      }>;
      skills: Array<{
        category: string;
        items: string;
      }>;
      updatedAt: Date;
    };
  };
}

interface GitHubDisconnectResponse {
  success: boolean;
  message: string;
}

interface SaveParsedResumeResponse {
  success: boolean;
  message: string;
  data: {
    name: string;
    email: string;
    skills: string[];
    parsedAt: string;
  };
}

interface SaveTemplateResponse {
  success: boolean;
  message: string;
  data: {
    templateId: string;
    name: string;
    filePath: string;
  };
}

interface CreateSubscriptionRequest {
  planId: string;
  planName: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  currency: string;
  paypalOrderId: string;
}

interface CreateSubscriptionResponse {
  subscriptionId: string;
  status: string;
}

interface UpdateSubscriptionStatusRequest {
  subscriptionId: string;
  status: string;
  paypalOrderId: string;
}

interface UpdateSubscriptionStatusResponse {
  success: boolean;
  message: string;
}

interface GitHubProject {
  id: string;
  name: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  resumeUrl?: string;
  resumeUploadedAt?: string;
  skills: string[];
  githubProfile?: {
    username: string;
    url: string;
    connectedAt: string;
  };
  githubProjects?: GitHubProject[];
  githubConnected: boolean;
  githubLastUpdated?: string;
  parsedResume?: ParsedResumeData;
  linkedInProfile?: string;
  linkedInData?: LinkedInData;
  linkedInConnected: boolean;
  linkedInLastUpdated?: string;
  selectedTemplate?: {
    id: string;
    name: string;
    filePath: string;
    selectedAt: string;
  };
  transformedResume?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    education: Array<{
      startDate: string;
      endDate: string;
      institution: string;
      degree: string;
      gpa?: string;
      coursework?: string;
    }>;
    experience: Array<{
      startDate: string;
      endDate: string;
      title: string;
      company: string;
      location: string;
      highlights: string[];
    }>;
    projects: Array<{
      name: string;
      link?: string;
      date?: string;
      description: string[];
      technologies?: string;
    }>;
    skills: Array<{
      category: string;
      items: string;
    }>;
    updatedAt: string;
  };
}

export const api = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return handleResponse<LoginResponse>(response);
  },

  async register(name: string, email: string, password: string): Promise<ApiResponse<RegisterResponse>> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    return handleResponse<RegisterResponse>(response);
  },

  async getProfile(token: string): Promise<ApiResponse<ProfileResponse>> {
    try {
      const response = await fetch('/api/users/profile', {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch profile' };
    }
  },

  async submitContactForm(formData: ContactFormData) {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    return handleResponse(response);
  },

  uploadResume: async (file: File): Promise<ApiResponse<ResumeUploadResponse>> => {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_URL}/resume/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  async getGitHubAuthUrl(): Promise<ApiResponse<GitHubAuthUrlResponse>> {
    try {
      const response = await fetch(`${API_URL}/auth/github/url`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<GitHubAuthUrlResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get GitHub auth URL' };
    }
  },

  async connectGitHubProfile(githubUrl: string): Promise<ApiResponse<GitHubProfileResponse>> {
    try {
      const response = await fetch(`${API_URL}/auth/github/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ githubUrl }),
      });

      return handleResponse<GitHubProfileResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to connect GitHub profile' };
    }
  },

  async disconnectGitHubProfile(): Promise<ApiResponse<GitHubDisconnectResponse>> {
    try {
      const response = await fetch(`${API_URL}/auth/github/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<GitHubDisconnectResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to disconnect GitHub profile' };
    }
  },

  saveParsedResume: async (data: ParsedResumeData): Promise<ApiResponse<SaveParsedResumeResponse>> => {
    try {
      const response = await fetch(`${API_URL}/resume/save-parsed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      return handleResponse<SaveParsedResumeResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to save resume data' };
    }
  },

  async parseLinkedInProfile(profileUrl: string) {
    try {
      const response = await fetch(`${API_URL}/linkedin/parse-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ profileUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse LinkedIn profile');
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error parsing LinkedIn profile:', error);
      throw error;
    }
  },

  async disconnectLinkedInProfile(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await fetch('/api/linkedin/disconnect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to disconnect LinkedIn profile' };
    }
  },

  async saveTemplate(templateData: any): Promise<ApiResponse<SaveTemplateResponse>> {
    try {
      const response = await fetch(`${API_URL}/resume/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(templateData),
      });

      return handleResponse<SaveTemplateResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to save template' };
    }
  },

  async updateTransformedResumeUrls(): Promise<ApiResponse<{ success: boolean; message: string; data: { github: string; linkedin: string } }>> {
    try {
      const response = await fetch(`${API_URL}/resume/update-urls`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<{ success: boolean; message: string; data: { github: string; linkedin: string } }>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update transformed resume URLs' };
    }
  },

  getResumeHistory: async (): Promise<ApiResponse<ResumeHistoryResponse>> => {
    try {
      const response = await fetch(`${API_URL}/resume/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<ResumeHistoryResponse>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch resume history' };
    }
  },

  deleteResume: async (resumeId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    try {
      const response = await fetch(`${API_URL}/resume/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete resume' };
    }
  },

  downloadResume: async (resumeId: string): Promise<ApiResponse<ResumeHistoryItem>> => {
    try {
      const response = await fetch(`${API_URL}/resume/${resumeId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await handleResponse<{ success: boolean; data: ResumeHistoryItem }>(response);
      
      if (result.data) {
        return { data: result.data.data };
      }
      
      return { error: result.error || 'Failed to download resume' };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to download resume' };
    }
  },

  // Jobs API methods
  getJobs: async (params?: Record<string, any>): Promise<ApiResponse<{ jobs: any[]; pagination: any }>> => {
    try {
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const url = queryString ? `${API_URL}/jobs?${queryString}` : `${API_URL}/jobs`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<{ jobs: any[]; pagination: any }>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch jobs' };
    }
  },

  getJobCategories: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await fetch(`${API_URL}/jobs/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<string[]>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch job categories' };
    }
  },

  getJobStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_URL}/jobs/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<any>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch job statistics' };
    }
  },

  getJobById: async (jobId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<any>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch job details' };
    }
  },

  deleteJob: async (jobId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete job' };
    }
  },

  incrementApplyClickCount: async (jobId: string): Promise<ApiResponse<{ success: boolean; message: string; applyClickCount: number }>> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse<{ success: boolean; message: string; applyClickCount: number }>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to increment apply click count' };
    }
  },

  createJob: async (jobData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(jobData),
      });

      return handleResponse<any>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create job' };
    }
  },

  updateJob: async (jobId: string, jobData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(jobData),
      });

      return handleResponse<any>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update job' };
    }
  },

  fetchLinkedInProfile: async () => {
    try {
      const response = await fetch('/api/linkedin/profile', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch LinkedIn profile' };
    }
  },

  // Add more API methods as needed
}; 