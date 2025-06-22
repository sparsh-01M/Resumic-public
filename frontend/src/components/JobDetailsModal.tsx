import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, DollarSign, Building, Briefcase, GraduationCap, Star, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import Button from './ui/Button';

interface Job {
  _id: string;
  jobTitle: string;
  companyName: string;
  companyOverview: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
  salaryRange?: string;
  jobDescription: string;
  responsibilities: string[];
  requirements: {
    required: string[];
    preferred?: string[];
  };
  applicationDeadline?: string;
  applicationLink: string;
  educationLevel?: string;
  experienceLevel: 'Entry-level' | 'Mid-level' | 'Senior' | 'Executive';
  category: 'tech' | 'sales' | 'marketing' | 'design' | 'product' | 'operations' | 'finance' | 'hr' | 'other';
  isRemote: boolean;
  isHybrid: boolean;
  isOnsite: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailsModal = ({ job, isOpen, onClose }: JobDetailsModalProps) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = () => {
    setIsApplying(true);
    // Simulate a brief delay before opening the application link
    setTimeout(() => {
      window.open(job?.applicationLink, '_blank');
      setIsApplying(false);
      onClose();
    }, 500);
  };

  const getEmploymentTypeIcon = (type: string) => {
    switch (type) {
      case 'Full-time':
        return <Clock className="w-4 h-4" />;
      case 'Part-time':
        return <Clock className="w-4 h-4" />;
      case 'Contract':
        return <Briefcase className="w-4 h-4" />;
      case 'Internship':
        return <GraduationCap className="w-4 h-4" />;
      case 'Freelance':
        return <Star className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      tech: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      marketing: 'bg-purple-100 text-purple-800',
      design: 'bg-pink-100 text-pink-800',
      product: 'bg-indigo-100 text-indigo-800',
      operations: 'bg-yellow-100 text-yellow-800',
      finance: 'bg-emerald-100 text-emerald-800',
      hr: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!job) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(job.category)}`}>
                      {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {/* Job Title and Company */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.jobTitle}
                  </h1>
                  <div className="flex items-center gap-4 text-lg text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      <span className="font-semibold">{job.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getEmploymentTypeIcon(job.employmentType)}
                      <span>{job.employmentType}</span>
                    </div>
                  </div>

                  {/* Work Arrangement Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.isRemote && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                        Remote
                      </span>
                    )}
                    {job.isHybrid && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                        Hybrid
                      </span>
                    )}
                    {job.isOnsite && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                        On-site
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                  {job.salaryRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Salary Range</p>
                        <p className="font-semibold text-gray-900">{job.salaryRange}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Experience Level</p>
                      <p className="font-semibold text-gray-900">{job.experienceLevel}</p>
                    </div>
                  </div>
{/*                   {job.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Application Deadline</p>
                        <p className="font-semibold text-gray-900">{formatDate(job.applicationDeadline)}</p>
                      </div>
                    </div>
                  )} */}
                </div>

                {/* Company Overview */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About {job.companyName}</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {job.companyOverview}
                  </p>
                </div>

                {/* Job Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {job.jobDescription}
                  </p>
                </div>

                {/* Responsibilities */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Key Responsibilities</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
                  
                  {/* Required Qualifications */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Required Qualifications</h3>
                    <ul className="space-y-2">
                      {job.requirements.required.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Preferred Qualifications */}
                  {job.requirements.preferred && job.requirements.preferred.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Preferred Qualifications</h3>
                      <ul className="space-y-2">
                        {job.requirements.preferred.map((requirement, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Education Level */}
                {job.educationLevel && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Education</h2>
                    <p className="text-gray-700">{job.educationLevel}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    {isApplying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apply for this Position
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JobDetailsModal; 
