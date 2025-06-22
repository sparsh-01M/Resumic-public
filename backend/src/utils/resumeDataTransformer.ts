// Utility to transform/normalize resume data for MongoDB (backend version)

import { IUser } from '../models/User';

export interface ParsedResumeData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationYear: string;
    startYear?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
    duration?: string;
    url?: string;
  }>;
  skills: string[];
}

export interface TemplateResumeData {
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
  updatedAt?: Date;
}

function parseDuration(duration: string = ''): { startDate: string; endDate: string } {
  if (!duration) return { startDate: '', endDate: '' };
  if (duration.toLowerCase().includes('present') || duration.toLowerCase().includes('current')) {
    const parts = duration.split(' - ');
    if (parts.length === 2) {
      return {
        startDate: parts[0].trim(),
        endDate: 'Present'
      };
    }
  }
  const rangeMatch = duration.match(/([A-Za-z]+\s+\d{4})\s*-\s*([A-Za-z]+\s+\d{4}|Present)/);
  if (rangeMatch) {
    return {
      startDate: rangeMatch[1],
      endDate: rangeMatch[2]
    };
  }
  const yearMatch = duration.match(/\d{4}/);
  if (yearMatch) {
    return {
      startDate: yearMatch[0],
      endDate: yearMatch[0]
    };
  }
  return {
    startDate: duration,
    endDate: 'Present'
  };
}

export function transformResumeData(
  user: IUser
): TemplateResumeData {
  const parsed = user.parsedResume || {};
  const githubUrl = user.githubProfile?.url || '';
  const linkedinUrl = user.linkedInProfile || '';
  const website = '';
  const name = user.name || parsed.name || '';
  const email = user.email || parsed.email || '';
  const phone = parsed.phone || '';
  const location = parsed.location || '';
  // Prefer user.skills if available, else parsed.skills
  const allSkills = (user.skills && user.skills.length > 0) ? user.skills : (parsed.skills || []);

  return {
    name,
    email,
    phone,
    location,
    website,
    linkedin: linkedinUrl,
    github: githubUrl,
    education: (parsed.education || []).map(edu => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      startDate: edu.startYear || '',
      endDate: edu.graduationYear || '',
      gpa: edu.gpa,
      coursework: Array.isArray(edu.coursework) ? edu.coursework.join(', ') : edu.coursework
    })),
    experience: (parsed.experience || []).map(exp => {
      const { startDate, endDate } = parseDuration(exp.duration || '');
      return {
        company: exp.company || '',
        title: exp.position || '',
        location: '',
        startDate,
        endDate,
        highlights: exp.description ? [exp.description] : []
      };
    }),
    projects: (parsed.projects || []).map(proj => ({
      name: proj.name || '',
      description: proj.description ? [proj.description] : [],
      technologies: proj.technologies ? proj.technologies.join(', ') : undefined,
      link: proj.url || undefined
    })),
    skills: [
      {
        category: 'Skills',
        items: allSkills.join(', ')
      }
    ],
    updatedAt: new Date()
  };
} 