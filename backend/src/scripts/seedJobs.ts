import mongoose from 'mongoose';
import { Job } from '../models/Job.js';

// const sampleJobs = [
//   {
//     jobTitle: 'Senior Software Engineer',
//     companyName: 'TechCorp Solutions',
//     companyOverview: 'A leading technology company specializing in cloud infrastructure and AI solutions. We are committed to innovation and creating impactful products that solve real-world problems.',
//     location: 'San Francisco, CA',
//     employmentType: 'Full-time' as const,
//     salaryRange: '$120,000 - $180,000',
//     jobDescription: 'We are looking for a Senior Software Engineer to join our core platform team. You will be responsible for designing and implementing scalable backend services, mentoring junior developers, and contributing to our technical architecture decisions.',
//     responsibilities: [
//       'Design and implement scalable backend services using Node.js, Python, and Go',
//       'Collaborate with cross-functional teams to define and implement new features',
//       'Mentor junior developers and conduct code reviews',
//       'Participate in technical architecture discussions and decisions',
//       'Write clean, maintainable, and well-tested code',
//       'Optimize application performance and scalability'
//     ],
//     requirements: {
//       required: [
//         '5+ years of experience in software development',
//         'Strong proficiency in Node.js, Python, or Go',
//         'Experience with cloud platforms (AWS, GCP, or Azure)',
//         'Knowledge of database design and optimization',
//         'Experience with microservices architecture',
//         'Strong problem-solving and analytical skills'
//       ],
//       preferred: [
//         'Experience with Kubernetes and Docker',
//         'Knowledge of machine learning and AI',
//         'Contributions to open-source projects',
//         'Experience with CI/CD pipelines'
//       ]
//     },
//     applicationLink: 'https://techcorp.com/careers/senior-software-engineer',
//     experienceLevel: 'Senior' as const,
//     category: 'tech' as const,
//     isRemote: true,
//     isHybrid: false,
//     isOnsite: false,
//     educationLevel: 'Bachelor\'s degree in Computer Science or related field'
//   },
//   {
//     jobTitle: 'Product Marketing Manager',
//     companyName: 'GrowthStart Inc.',
//     companyOverview: 'A fast-growing startup focused on revolutionizing the SaaS industry. We build tools that help businesses scale efficiently and reach their full potential.',
//     location: 'New York, NY',
//     employmentType: 'Full-time' as const,
//     salaryRange: '$90,000 - $130,000',
//     jobDescription: 'We are seeking a Product Marketing Manager to develop and execute marketing strategies for our SaaS products. You will work closely with product, sales, and design teams to create compelling messaging and drive user acquisition.',
//     responsibilities: [
//       'Develop and execute product marketing strategies',
//       'Create compelling product messaging and positioning',
//       'Collaborate with product team on go-to-market strategies',
//       'Analyze market trends and competitive landscape',
//       'Create marketing collateral and sales enablement materials',
//       'Track and report on marketing campaign performance'
//     ],
//     requirements: {
//       required: [
//         '3+ years of experience in product marketing',
//         'Experience in B2B SaaS marketing',
//         'Strong analytical and data-driven mindset',
//         'Excellent written and verbal communication skills',
//         'Experience with marketing automation tools',
//         'Ability to work cross-functionally with multiple teams'
//       ],
//       preferred: [
//         'Experience with HubSpot, Marketo, or similar platforms',
//         'Knowledge of SEO and content marketing',
//         'Experience in startup environments',
//         'MBA or relevant advanced degree'
//       ]
//     },
//     applicationLink: 'https://growthstart.com/careers/product-marketing-manager',
//     experienceLevel: 'Mid-level' as const,
//     category: 'marketing' as const,
//     isRemote: false,
//     isHybrid: true,
//     isOnsite: false,
//     educationLevel: 'Bachelor\'s degree in Marketing, Business, or related field'
//   },
//   {
//     jobTitle: 'UX/UI Designer',
//     companyName: 'CreativeStudio',
//     companyOverview: 'A design agency that creates beautiful, user-centered digital experiences. We work with clients across various industries to deliver innovative design solutions.',
//     location: 'Austin, TX',
//     employmentType: 'Full-time' as const,
//     salaryRange: '$80,000 - $120,000',
//     jobDescription: 'We are looking for a talented UX/UI Designer to join our creative team. You will be responsible for creating user-centered designs by understanding business requirements, user feedback, and research insights.',
//     responsibilities: [
//       'Create user-centered designs by understanding business requirements',
//       'Create user flows, wireframes, prototypes, and mockups',
//       'Translate requirements into style guides, design systems, and user interfaces',
//       'Create original graphic designs (e.g., images, sketches, and tables)',
//       'Identify and troubleshoot UX problems',
//       'Collaborate with developers to ensure design feasibility'
//     ],
//     requirements: {
//       required: [
//         '3+ years of UX/UI design experience',
//         'Proficiency in Figma, Sketch, or Adobe Creative Suite',
//         'Strong portfolio showcasing web and mobile design work',
//         'Experience with user research and usability testing',
//         'Knowledge of design systems and component libraries',
//         'Understanding of accessibility and inclusive design principles'
//       ],
//       preferred: [
//         'Experience with prototyping tools (Framer, Principle)',
//         'Knowledge of HTML, CSS, and JavaScript',
//         'Experience with design sprints and agile methodologies',
//         'Background in psychology or human-computer interaction'
//       ]
//     },
//     applicationLink: 'https://creativestudio.com/careers/ux-ui-designer',
//     experienceLevel: 'Mid-level' as const,
//     category: 'design' as const,
//     isRemote: true,
//     isHybrid: false,
//     isOnsite: false,
//     educationLevel: 'Bachelor\'s degree in Design, HCI, or related field'
//   },
//   {
//     jobTitle: 'Sales Development Representative',
//     companyName: 'SalesForce Pro',
//     companyOverview: 'A dynamic sales organization that helps businesses grow through innovative sales solutions and strategies. We focus on building long-term relationships with our clients.',
//     location: 'Chicago, IL',
//     employmentType: 'Full-time' as const,
//     salaryRange: '$50,000 - $70,000 + commission',
//     jobDescription: 'We are seeking a Sales Development Representative to generate new business opportunities by qualifying leads and setting up meetings for our sales team. This is an excellent opportunity to start your career in sales.',
//     responsibilities: [
//       'Generate new business opportunities through outbound prospecting',
//       'Qualify leads and set up meetings for the sales team',
//       'Research and identify potential customers',
//       'Maintain accurate records in CRM system',
//       'Collaborate with marketing team on lead generation campaigns',
//       'Achieve monthly and quarterly targets'
//     ],
//     requirements: {
//       required: [
//         '1+ years of sales or customer service experience',
//         'Excellent communication and interpersonal skills',
//         'Strong organizational and time management skills',
//         'Ability to work in a fast-paced environment',
//         'Proficiency in CRM systems (Salesforce preferred)',
//         'Bachelor\'s degree or equivalent experience'
//       ],
//       preferred: [
//         'Experience in B2B sales',
//         'Knowledge of sales automation tools',
//         'Experience with cold calling and email outreach',
//         'Understanding of sales methodologies (SPIN, Challenger, etc.)'
//       ]
//     },
//     applicationLink: 'https://salesforcepro.com/careers/sdr',
//     experienceLevel: 'Entry-level' as const,
//     category: 'sales' as const,
//     isRemote: false,
//     isHybrid: false,
//     isOnsite: true,
//     educationLevel: 'Bachelor\'s degree preferred'
//   },
//   {
//     jobTitle: 'Data Scientist',
//     companyName: 'DataInsights Corp',
//     companyOverview: 'A data-driven company that helps organizations make better decisions through advanced analytics and machine learning. We work with clients across various industries to extract insights from their data.',
//     location: 'Seattle, WA',
//     employmentType: 'Full-time' as const,
//     salaryRange: '$110,000 - $160,000',
//     jobDescription: 'We are looking for a Data Scientist to join our analytics team. You will be responsible for developing machine learning models, analyzing complex datasets, and providing actionable insights to our clients.',
//     responsibilities: [
//       'Develop and implement machine learning models',
//       'Analyze large datasets to extract meaningful insights',
//       'Create data visualizations and reports',
//       'Collaborate with engineering team to deploy models',
//       'Communicate findings to stakeholders',
//       'Stay up-to-date with latest data science trends and techniques'
//     ],
//     requirements: {
//       required: [
//         '3+ years of experience in data science or analytics',
//         'Strong programming skills in Python or R',
//         'Experience with machine learning frameworks (TensorFlow, PyTorch)',
//         'Knowledge of SQL and database systems',
//         'Experience with data visualization tools',
//         'Strong statistical and mathematical background'
//       ],
//       preferred: [
//         'Experience with big data technologies (Spark, Hadoop)',
//         'Knowledge of deep learning and neural networks',
//         'Experience with cloud platforms (AWS, GCP)',
//         'PhD in Computer Science, Statistics, or related field'
//       ]
//     },
//     applicationLink: 'https://datainsights.com/careers/data-scientist',
//     experienceLevel: 'Mid-level' as const,
//     category: 'tech' as const,
//     isRemote: true,
//     isHybrid: false,
//     isOnsite: false,
//     educationLevel: 'Master\'s degree in Data Science, Statistics, or related field'
//   }
// ];

const seedJobs = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resumicai';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Insert sample jobs
    // const insertedJobs = await Job.insertMany(sampleJobs);
    // console.log(`Successfully inserted ${insertedJobs.length} jobs`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs(); 