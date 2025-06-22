import React from 'react';

const PortfolioPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-primary-700 dark:text-primary-300 text-center">Portfolio Page (Coming Soon)</h1>
        <ul className="text-lg text-gray-700 dark:text-gray-200 mb-6 text-left list-disc pl-6">
          <li>No-code personal portfolio website</li>
          <li>Directly deployed and ready to use</li>
          <li>No manual data entry required for education, experience, projects, etc.</li>
          <li>Portfolio generated automatically from your resume and connected accounts</li>
        </ul>
        <div className="mt-2 px-4 py-2 rounded bg-yellow-100 text-yellow-800 text-center font-semibold">
          This feature is for <span className="text-yellow-900 font-bold">Pro users</span>.
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage; 