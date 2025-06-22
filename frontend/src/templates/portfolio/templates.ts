export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  features: string[];
}

export const portfolioTemplates: PortfolioTemplate[] = [
  {
    id: 'portfolio1',
    name: 'Modern Portfolio',
    description: 'A sleek, modern portfolio template perfect for developers and designers.',
    previewImage: '/templates/previews/template1.png',
    features: [
      'Project gallery',
      'About section',
      'Contact form',
      'Responsive design'
    ]
  },
  {
    id: 'portfolio2',
    name: 'Creative Showcase',
    description: 'A creative template for artists and creators to showcase their work.',
    previewImage: '/templates/previews/template2.png',
    features: [
      'Image grid',
      'Animated transitions',
      'Social media links',
      'Customizable colors'
    ]
  },
  {
    id: 'portfolio3',
    name: 'Minimalist Portfolio',
    description: 'A clean and minimalist template for a professional online presence.',
    previewImage: '/templates/previews/template3.png',
    features: [
      'Simple layout',
      'Focus on content',
      'Easy navigation',
      'Fast loading'
    ]
  }
]; 