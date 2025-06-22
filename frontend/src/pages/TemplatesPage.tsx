import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Download, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  rating: number;
  downloads: number;
  isPopular?: boolean;
  isNew?: boolean;
}

// Template name mappings for better display names
const templateNameMap: { [key: string]: string } = {
  'template1': 'Modern Professional',
  'template2': 'Creative Portfolio',
  'template3': 'Minimal Clean',
  'template4': 'Executive Suite',
  'template5': 'Tech Startup',
  'template6': 'Corporate Classic',
  'template7': 'Academic Research',
  'template8': 'Freelance Gig',
  'template9': 'Tech Developer',
  'template10': 'Creative Designer'
};

// Category mappings for automatic categorization
const categoryMap: { [key: string]: string } = {
  'template1': 'Professional',
  'template2': 'Creative',
  'template3': 'Minimal',
  'template4': 'Executive',
  'template5': 'Technology',
  'template6': 'Corporate',
  'template7': 'Academic',
  'template8': 'Freelance',
  'template9': 'Technology',
  'template10': 'Creative'
};

// Description templates for different categories
const descriptionTemplates: { [key: string]: string } = {
  'Professional': 'Clean and modern design perfect for corporate environments with excellent ATS compatibility',
  'Creative': 'Bold and creative design for artists, designers, and creative professionals',
  'Minimal': 'Simple and elegant design focusing on content with maximum readability',
  'Executive': 'Sophisticated design for senior-level professionals and executives',
  'Technology': 'Modern design perfect for tech professionals, developers, and startup environments',
  'Corporate': 'Traditional corporate design with modern touches and professional appeal',
  'Academic': 'Formal design suitable for academic and research positions',
  'Freelance': 'Versatile design for freelancers and contractors across various industries'
};

const TemplatesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  // Function to generate a random rating between 4.0 and 5.0
  const generateRating = () => {
    return Math.round((Math.random() * 1 + 4) * 10) / 10;
  };

  // Function to generate a random download count
  const generateDownloads = () => {
    return Math.floor(Math.random() * 2000) + 100;
  };

  // Function to check if template should be marked as popular or new
  const getTemplateBadges = (templateId: string) => {
    const badges: { isPopular?: boolean; isNew?: boolean } = {};
    
    // Mark first 2 templates as popular
    if (['template1', 'template2'].includes(templateId)) {
      badges.isPopular = true;
    }
    
    // Mark last 2 templates as new
    if (['template9', 'template10'].includes(templateId)) {
      badges.isNew = true;
    }
    
    return badges;
  };

  // Function to dynamically load templates
  const loadTemplates = async () => {
    const loadedTemplates: Template[] = [];
    const uniqueCategories = new Set<string>();
    
    // Try to load templates from template1 to template20 (adjust range as needed)
    for (let i = 1; i <= 20; i++) {
      const templateId = `template${i}`;
      const imageUrl = `/templates/previews/${templateId}.png`;
      
      try {
        // Check if the image exists by trying to load it
        const response = await fetch(imageUrl, { method: 'HEAD' });
        
        if (response.ok) {
          const category = categoryMap[templateId] || 'Professional';
          const name = templateNameMap[templateId] || `Template ${i}`;
          const description = descriptionTemplates[category] || 'Professional resume template with excellent ATS compatibility';
          
          const template: Template = {
            id: templateId,
            name,
            category,
            description,
            imageUrl,
            rating: generateRating(),
            downloads: generateDownloads(),
            ...getTemplateBadges(templateId)
          };
          
          loadedTemplates.push(template);
          uniqueCategories.add(category);
        }
      } catch (error) {
        // If template doesn't exist, continue to next
        continue;
      }
    }
    
    setTemplates(loadedTemplates);
    setCategories(['All', ...Array.from(uniqueCategories).sort()]);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              className="inline-block text-primary-600 dark:text-primary-400 mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FileText size={48} />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Resume Templates
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our collection of professionally designed, ATS-optimized resume templates
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {templates.length} templates available
            </p>
          </div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Templates Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Template Image */}
                <div className="relative">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {template.isPopular && (
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    )}
                    {template.isNew && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                      <Eye className="w-4 h-4 mr-2" />
                      View Template
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TemplatesPage; 