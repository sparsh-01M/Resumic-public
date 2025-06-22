import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, X, Loader2 } from 'lucide-react';
import Button from './ui/Button';

interface LinkedInConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LINKEDIN_AUTH_URL = '/api/linkedin/auth/linkedin';

const LinkedInConnectModal = ({ isOpen, onClose, onSuccess }: LinkedInConnectModalProps) => {
  const handleConnect = () => {
    window.location.href = LINKEDIN_AUTH_URL;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Connect LinkedIn Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center">
              <p className="mb-4 text-gray-700 dark:text-gray-300 text-center">
                Click below to securely connect your LinkedIn account using LinkedIn OAuth. You will be redirected to LinkedIn to authorize access.
              </p>
                <Button
                  type="button"
                  variant="primary"
                onClick={handleConnect}
                className="w-full flex items-center justify-center"
              >
                      <Linkedin className="w-4 h-4 mr-2" />
                Connect with LinkedIn
                </Button>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LinkedInConnectModal; 