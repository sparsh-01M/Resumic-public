import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Star, Clock, FileText, Eye } from 'lucide-react';
import Button from './ui/Button';

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: {
    id: string;
    name: string;
    originalName: string;
    url: string;
    atsScore?: number;
    uploadedAt: string;
    fileSize: number;
    fileType: string;
  } | null;
}

const ResumeViewerModal = ({ isOpen, onClose, resume }: ResumeViewerModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const handleDownload = async () => {
    if (!resume) return;
    
    try {
      setIsLoading(true);
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = resume.url;
      link.download = resume.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    if (!resume) return;
    
    try {
      setIsViewing(true);
      
      // For PDFs, use Google Docs viewer to prevent downloads
      if (resume.fileType.includes('pdf')) {
        // Use Google Docs viewer to display PDF without download
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(resume.url)}&embedded=true`;
        window.open(googleDocsUrl, '_blank');
      } else {
        // For non-PDF files, just open the URL
        window.open(resume.url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing resume:', error);
    } finally {
      setIsViewing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600 dark:text-success-400';
    if (score >= 80) return 'text-warning-600 dark:text-warning-400';
    return 'text-error-600 dark:text-error-400';
  };

  const getATSScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  if (!resume) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {resume.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {resume.originalName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Resume Info */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Uploaded</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                </div>
                
                {resume.atsScore && (
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">ATS Score</p>
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-semibold ${getATSScoreColor(resume.atsScore)}`}>
                          {resume.atsScore}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({getATSScoreLabel(resume.atsScore)})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">File Type</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                      {resume.fileType.split('/')[1] || resume.fileType}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Viewer */}
            <div className="flex-1 overflow-hidden">
              <div className="w-full h-96 md:h-[60vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {resume.fileType.includes('pdf') ? 'PDF Resume' : 'Resume'}: {resume.name}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={handleView}
                      disabled={isViewing}
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isViewing ? 'Opening...' : 'View Resume'}</span>
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleDownload}
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isLoading ? 'Downloading...' : 'Download'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Click outside or press ESC to close
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleView}
                  disabled={isViewing}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isViewing ? 'Opening...' : 'View'}</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isLoading ? 'Downloading...' : 'Download'}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResumeViewerModal; 