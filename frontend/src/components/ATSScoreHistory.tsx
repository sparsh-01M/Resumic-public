import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, FileText, Clock, Star } from 'lucide-react';
import { api } from '../services/api';
import Button from './ui/Button';
import ResumeViewerModal from './ResumeViewerModal';

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

const ATSScoreHistory = () => {
  const [resumes, setResumes] = useState<ResumeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<ResumeHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchResumeHistory();
  }, []);

  const fetchResumeHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await api.getResumeHistory();
      
      if (error) {
        setError(error);
        return;
      }

      if (data) {
        setResumes(data.data);
      }
    } catch (err) {
      setError('Failed to fetch resume history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      setDeletingId(resumeId);
      const { error } = await api.deleteResume(resumeId);
      
      if (error) {
        setError(error);
        return;
      }

      // Remove from local state
      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
    } catch (err) {
      setError('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (resume: ResumeHistoryItem) => {
    try {
      const { data, error } = await api.downloadResume(resume.id);
      
      if (error) {
        setError(error);
        return;
      }

      if (data) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = data.url;
        link.download = data.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError('Failed to download resume');
    }
  };

  const handleResumeClick = (resume: ResumeHistoryItem) => {
    setSelectedResume(resume);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResume(null);
  };

  const formatDate = (dateString: string) => {
    try {
      console.log('Formatting date:', dateString, 'Type:', typeof dateString);
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Unknown date';
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      // Handle different time ranges
      if (diffInMs < 0) {
        // Future date (shouldn't happen for uploads, but handle gracefully)
        return date.toLocaleDateString();
      } else if (diffInMs < 60000) { // Less than 1 minute
        return 'Just now';
      } else if (diffInMs < 3600000) { // Less than 1 hour
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) { // Less than 24 hours
        return `${diffInHours}h ago`;
      } else if (diffInDays === 1) { // Yesterday
        return 'Yesterday';
      } else if (diffInDays < 7) { // Less than a week
        return `${diffInDays}d ago`;
      } else if (diffInDays < 30) { // Less than a month
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks}w ago`;
      } else if (diffInDays < 365) { // Less than a year
        const months = Math.floor(diffInDays / 30);
        return `${months}mo ago`;
      } else { // More than a year
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Unknown date';
    }
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600 dark:text-success-400';
    if (score >= 80) return 'text-warning-600 dark:text-warning-400';
    return 'text-error-600 dark:text-error-400';
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-error-600 dark:text-error-400 text-sm">{error}</div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchResumeHistory}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="p-4 text-center">
        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No resumes uploaded yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          ATS Score History
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleResumeClick(resume)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {resume.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(resume.uploadedAt)}
                      </span>
                    </div>
                  </div>
                  
                  {resume.atsScore && (
                    <div className="flex items-center space-x-1 ml-2">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className={`text-xs font-semibold ${getATSScoreColor(resume.atsScore)}`}>
                        {resume.atsScore}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Click to view details
                  </span>
                  
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(resume)}
                      className="p-1 h-6 w-6"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className="p-1 h-6 w-6 text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                      title="Delete"
                    >
                      {deletingId === resume.id ? (
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Resume Viewer Modal */}
      <ResumeViewerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        resume={selectedResume}
      />
    </>
  );
};

export default ATSScoreHistory; 