import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Clock, DollarSign, Building, Briefcase, GraduationCap, Star, ExternalLink, AlertCircle, Plus, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import JobDetailsModal from '../components/JobDetailsModal';
import { useNavigate, Link } from 'react-router-dom';

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
  applyClickCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface JobFilters {
  search: string;
  category: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  isRemote: boolean;
  isHybrid: boolean;
  isOnsite: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalJobs: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const JobsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    category: '',
    location: '',
    employmentType: '',
    experienceLevel: '',
    isRemote: false,
    isHybrid: false,
    isOnsite: false,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    companyOverview: '',
    location: '',
    employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance',
    salaryRange: '',
    jobDescription: '',
    responsibilities: [''],
    requirements: {
      required: [''],
      preferred: [''],
    },
    applicationLink: '',
    educationLevel: '',
    experienceLevel: 'Entry-level' as 'Entry-level' | 'Mid-level' | 'Senior' | 'Executive',
    category: 'tech' as 'tech' | 'sales' | 'marketing' | 'design' | 'product' | 'operations' | 'finance' | 'hr' | 'other',
    isRemote: false,
    isHybrid: false,
    isOnsite: false,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchJobsBatch = async (page = 1, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setJobs([]);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page: page.toString(),
        limit: '3', // Fetch 3 jobs at a time
        ...filters,
      };

      const response = await api.getJobs(params);
      if (response.error) {
        if (response.error.includes('Pro subscription')) {
          setError('Pro subscription required to access job listings');
        } else {
          setError('Failed to load jobs');
        }
        toast.error('Failed to load jobs');
        return;
      }

      const { data } = response;
      if (!data || !data.jobs || !data.pagination) {
        setError('Invalid response format');
        toast.error('Failed to load jobs');
        return;
      }

      if (isInitialLoad) {
        setJobs(data.jobs);
      } else {
        setJobs(prev => [...prev, ...data.jobs]);
      }
      setPagination(data.pagination);
      setHasMoreJobs(data.pagination.hasNext);
    } catch (err: any) {
      setError('Failed to load jobs');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreJobs = async () => {
    if (!loadingMore && hasMoreJobs) {
      await fetchJobsBatch(pagination.currentPage + 1, false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getJobCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchJobsBatch(1, true);
    fetchCategories();
  }, [filters]);

  // Auto-load more jobs when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreJobs();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMoreJobs, pagination.currentPage]);

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setHasMoreJobs(true);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      employmentType: '',
      experienceLevel: '',
      isRemote: false,
      isHybrid: false,
      isOnsite: false,
    });
    setHasMoreJobs(true);
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      if (!user) {
        toast.error('Please log in to delete a job listing');
        navigate('/login');
        return;
      }

      const response = await api.deleteJob(jobId);
      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Job listing deleted successfully');
      fetchJobsBatch(1, true);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job listing');
    }
  };

  const handleApplyClick = async (jobId: string, applicationLink: string) => {
    try {
      // Call backend API to increment click count
      const response = await api.incrementApplyClickCount(jobId);
      if (response.error) {
        console.error('Error incrementing apply click count:', response.error);
      }

      // Open application link
      window.open(applicationLink, '_blank');
      
      // Show success message
      toast.success('Opening application page...');
    } catch (error) {
      console.error('Error incrementing apply click count:', error);
      // Still open the application link even if the count increment fails
      window.open(applicationLink, '_blank');
      toast.success('Opening application page...');
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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.jobTitle.trim()) errors.jobTitle = 'Job title is required';
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.companyOverview.trim()) errors.companyOverview = 'Company overview is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.jobDescription.trim()) errors.jobDescription = 'Job description is required';
    if (!formData.applicationLink.trim()) errors.applicationLink = 'Application link is required';
    if (formData.responsibilities.length === 0 || formData.responsibilities[0].trim() === '') {
      errors.responsibilities = 'At least one responsibility is required';
    }
    if (formData.requirements.required.length === 0 || formData.requirements.required[0].trim() === '') {
      errors.requirements = 'At least one required qualification is needed';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const jobData = {
        ...formData,
        responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
        requirements: {
          required: formData.requirements.required.filter(r => r.trim() !== ''),
          preferred: formData.requirements.preferred.filter(r => r.trim() !== ''),
        },
      };

      if (editingJob) {
        // Update existing job
        const response = await api.updateJob(editingJob._id, jobData);
        if (response.error) {
          throw new Error(response.error);
        }
        toast.success('Job updated successfully');
        setShowEditJobModal(false);
      } else {
        // Create new job
        const response = await api.createJob(jobData);
        if (response.error) {
          throw new Error(response.error);
        }
        toast.success('Job created successfully');
        setShowCreateJobModal(false);
      }

      // Reset form and refresh jobs
      resetForm();
      fetchJobsBatch(1, true);
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      companyName: '',
      companyOverview: '',
      location: '',
      employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance',
      salaryRange: '',
      jobDescription: '',
      responsibilities: [''],
      requirements: {
        required: [''],
        preferred: [''],
      },
      applicationLink: '',
      educationLevel: '',
      experienceLevel: 'Entry-level' as 'Entry-level' | 'Mid-level' | 'Senior' | 'Executive',
      category: 'tech' as 'tech' | 'sales' | 'marketing' | 'design' | 'product' | 'operations' | 'finance' | 'hr' | 'other',
      isRemote: false,
      isHybrid: false,
      isOnsite: false,
    });
    setFormErrors({});
    setEditingJob(null);
  };

  const openCreateJobModal = () => {
    if (!user) {
      toast.error('Please log in to create a job listing');
      navigate('/login');
      return;
    }
    resetForm();
    setShowCreateJobModal(true);
  };

  const openEditJobModal = (job: Job) => {
    if (!user) {
      toast.error('Please log in to edit a job listing');
      navigate('/login');
      return;
    }
    setEditingJob(job);
    setFormData({
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      companyOverview: job.companyOverview,
      location: job.location,
      employmentType: job.employmentType,
      salaryRange: job.salaryRange || '',
      jobDescription: job.jobDescription,
      responsibilities: job.responsibilities.length > 0 ? job.responsibilities : [''],
      requirements: {
        required: job.requirements.required.length > 0 ? job.requirements.required : [''],
        preferred: job.requirements.preferred || [''],
      },
      applicationLink: job.applicationLink,
      educationLevel: job.educationLevel || '',
      experienceLevel: job.experienceLevel,
      category: job.category,
      isRemote: job.isRemote,
      isHybrid: job.isHybrid,
      isOnsite: job.isOnsite,
    });
    setFormErrors({});
    setShowEditJobModal(true);
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ''],
    }));
  };

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const updateResponsibility = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((r, i) => i === index ? value : r),
    }));
  };

  const addRequirement = (type: 'required' | 'preferred') => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [type]: [...prev.requirements[type], ''],
      },
    }));
  };

  const removeRequirement = (type: 'required' | 'preferred', index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [type]: prev.requirements[type].filter((_, i) => i !== index),
      },
    }));
  };

  const updateRequirement = (type: 'required' | 'preferred', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [type]: prev.requirements[type].map((r, i) => i === index ? value : r),
      },
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-primary-700 dark:text-primary-300 text-center">To access high quality jobs, please sign in first.</h1>
          <Link to="/login" className="mt-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors">Sign In</Link>
          <div className="mt-4 text-green-600 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded text-center text-lg font-medium">
            Also, join the waitlist to get one month of Resumic Pro free
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Jobs</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => fetchJobsBatch(1, true)}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Job Opportunities
              </h1>
              <p className="text-lg text-gray-600">
                Discover your next career move with our curated job listings
              </p>
            </div>
            <Button
              onClick={openCreateJobModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Job
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, State, or Remote"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type
                    </label>
                    <select
                      value={filters.employmentType}
                      onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Levels</option>
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>

                {/* Work Arrangement */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Arrangement
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isRemote}
                        onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
                        className="mr-2"
                      />
                      Remote
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isHybrid}
                        onChange={(e) => handleFilterChange('isHybrid', e.target.checked)}
                        className="mr-2"
                      />
                      Hybrid
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isOnsite}
                        onChange={(e) => handleFilterChange('isOnsite', e.target.checked)}
                        className="mr-2"
                      />
                      On-site
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {loading && jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Showing {jobs.length} of {pagination.totalJobs} jobs
                </p>
              </div>

              {/* Job Cards */}
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        {/* Job Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {job.jobTitle}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                {job.companyName}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {job.location}
                              </div>
                              <div className="flex items-center gap-1">
                                {getEmploymentTypeIcon(job.employmentType)}
                                {job.employmentType}
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(job.category)}`}>
                            {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                          </span>
                        </div>

                        {/* Company Overview */}
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {job.companyOverview}
                        </p>

                        {/* Job Description */}
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {job.jobDescription}
                        </p>

                        {/* Key Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {job.salaryRange && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>{job.salaryRange}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <GraduationCap className="w-4 h-4" />
                            <span>{job.experienceLevel}</span>
                          </div>
                        </div>

                        {/* Work Arrangement */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.isRemote && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Remote
                            </span>
                          )}
                          {job.isHybrid && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Hybrid
                            </span>
                          )}
                          {job.isOnsite && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              On-site
                            </span>
                          )}
                        </div>

                        {/* Requirements Preview */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Requirements:</h4>
                          <div className="flex flex-wrap gap-1">
                            {job.requirements.required.slice(0, 3).map((req, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {req}
                              </span>
                            ))}
                            {job.requirements.required.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                +{job.requirements.required.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 lg:ml-4">
                        <Button
                          onClick={() => handleApplyClick(job._id, job.applicationLink)}
                          className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Apply Now
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(job)}
                          className="w-full lg:w-auto"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Indicator */}
              {loadingMore && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading more jobs...</p>
                </div>
              )}

              {/* Load More Button (Alternative to auto-load) */}
              {!loadingMore && hasMoreJobs && (
                <div className="text-center py-8">
                  <Button
                    onClick={loadMoreJobs}
                    variant="outline"
                    className="px-8 py-3"
                  >
                    Load More Jobs
                  </Button>
                </div>
              )}

              {/* End of Results */}
              {!hasMoreJobs && jobs.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    You've reached the end of all available jobs.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={showJobModal}
        onClose={closeJobModal}
      />

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>
                  <button
                    onClick={() => setShowCreateJobModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.jobTitle ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.jobTitle && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.jobTitle}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.companyName}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Overview *
                    </label>
                    <textarea
                      value={formData.companyOverview}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyOverview: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.companyOverview ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.companyOverview && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.companyOverview}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.location && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type *
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                      placeholder="e.g., $50,000 - $70,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="tech">Tech</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="design">Design</option>
                      <option value="product">Product</option>
                      <option value="operations">Operations</option>
                      <option value="finance">Finance</option>
                      <option value="hr">HR</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      value={formData.jobDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.jobDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.jobDescription && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.jobDescription}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Link *
                    </label>
                    <input
                      type="url"
                      value={formData.applicationLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicationLink: e.target.value }))}
                      placeholder="https://example.com/apply"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.applicationLink ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.applicationLink && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.applicationLink}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education Level
                    </label>
                    <input
                      type="text"
                      value={formData.educationLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, educationLevel: e.target.value }))}
                      placeholder="e.g., Bachelor's degree"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Work Arrangement */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Arrangement
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isRemote}
                          onChange={(e) => setFormData(prev => ({ ...prev, isRemote: e.target.checked }))}
                          className="mr-2"
                        />
                        Remote
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isHybrid}
                          onChange={(e) => setFormData(prev => ({ ...prev, isHybrid: e.target.checked }))}
                          className="mr-2"
                        />
                        Hybrid
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isOnsite}
                          onChange={(e) => setFormData(prev => ({ ...prev, isOnsite: e.target.checked }))}
                          className="mr-2"
                        />
                        On-site
                      </label>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsibilities *
                    </label>
                    {formData.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={responsibility}
                          onChange={(e) => updateResponsibility(index, e.target.value)}
                          placeholder={`Responsibility ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {formData.responsibilities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResponsibility(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addResponsibility}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Responsibility
                    </button>
                    {formErrors.responsibilities && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.responsibilities}</p>
                    )}
                  </div>

                  {/* Required Requirements */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Qualifications *
                    </label>
                    {formData.requirements.required.map((requirement, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateRequirement('required', index, e.target.value)}
                          placeholder={`Required qualification ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {formData.requirements.required.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement('required', index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRequirement('required')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Required Qualification
                    </button>
                    {formErrors.requirements && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.requirements}</p>
                    )}
                  </div>

                  {/* Preferred Requirements */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Qualifications
                    </label>
                    {formData.requirements.preferred.map((requirement, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateRequirement('preferred', index, e.target.value)}
                          placeholder={`Preferred qualification ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeRequirement('preferred', index)}
                          className="px-3 py-2 text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRequirement('preferred')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Preferred Qualification
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateJobModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? 'Creating...' : 'Create Job'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Job Modal */}
      <AnimatePresence>
        {showEditJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Job</h2>
                  <button
                    onClick={() => setShowEditJobModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6">
                {/* Same form fields as create modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.jobTitle ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.jobTitle && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.jobTitle}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.companyName}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Overview *
                    </label>
                    <textarea
                      value={formData.companyOverview}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyOverview: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.companyOverview ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.companyOverview && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.companyOverview}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.location && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type *
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                      placeholder="e.g., $50,000 - $70,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="tech">Tech</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="design">Design</option>
                      <option value="product">Product</option>
                      <option value="operations">Operations</option>
                      <option value="finance">Finance</option>
                      <option value="hr">HR</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      value={formData.jobDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.jobDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.jobDescription && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.jobDescription}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Link *
                    </label>
                    <input
                      type="url"
                      value={formData.applicationLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicationLink: e.target.value }))}
                      placeholder="https://example.com/apply"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.applicationLink ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.applicationLink && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.applicationLink}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education Level
                    </label>
                    <input
                      type="text"
                      value={formData.educationLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, educationLevel: e.target.value }))}
                      placeholder="e.g., Bachelor's degree"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Work Arrangement */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Arrangement
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isRemote}
                          onChange={(e) => setFormData(prev => ({ ...prev, isRemote: e.target.checked }))}
                          className="mr-2"
                        />
                        Remote
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isHybrid}
                          onChange={(e) => setFormData(prev => ({ ...prev, isHybrid: e.target.checked }))}
                          className="mr-2"
                        />
                        Hybrid
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isOnsite}
                          onChange={(e) => setFormData(prev => ({ ...prev, isOnsite: e.target.checked }))}
                          className="mr-2"
                        />
                        On-site
                      </label>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsibilities *
                    </label>
                    {formData.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={responsibility}
                          onChange={(e) => updateResponsibility(index, e.target.value)}
                          placeholder={`Responsibility ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {formData.responsibilities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResponsibility(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addResponsibility}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Responsibility
                    </button>
                    {formErrors.responsibilities && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.responsibilities}</p>
                    )}
                  </div>

                  {/* Required Requirements */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Qualifications *
                    </label>
                    {formData.requirements.required.map((requirement, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateRequirement('required', index, e.target.value)}
                          placeholder={`Required qualification ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {formData.requirements.required.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement('required', index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRequirement('required')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Required Qualification
                    </button>
                    {formErrors.requirements && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.requirements}</p>
                    )}
                  </div>

                  {/* Preferred Requirements */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Qualifications
                    </label>
                    {formData.requirements.preferred.map((requirement, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateRequirement('preferred', index, e.target.value)}
                          placeholder={`Preferred qualification ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeRequirement('preferred', index)}
                          className="px-3 py-2 text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRequirement('preferred')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Preferred Qualification
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditJobModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? 'Updating...' : 'Update Job'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobsPage; 
