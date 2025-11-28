const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edufolio';

// Define Schemas
const UniversitySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    shortName: { type: String, trim: true },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    description: { type: String, required: true },
    establishedYear: { type: Number },
    location: { type: String, required: true },
    address: { type: String },
    website: { type: String },
    email: { type: String },
    phone: { type: String },
    rating: { type: String, enum: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Rated'], default: 'Not Rated' },
    accreditations: { type: [String], default: [] },
    approvals: { type: [String], default: [] },
    facilities: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    minFee: { type: Number, default: 0 },
    maxFee: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    ranking: { type: Number },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ProgramSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    duration: { type: String, required: true },
    mode: { type: String, enum: ['Online', 'Offline', 'Hybrid', 'Distance'], default: 'Online' },
    fee: { type: Number, required: true },
    feePeriod: { type: String, enum: ['Total', 'Per Year', 'Per Semester', 'Per Month'], default: 'Total' },
    description: { type: String, required: true },
    eligibility: { type: String, default: 'Graduate' },
    image: { type: String, default: '' },
    brochureUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    syllabus: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    careerOptions: { type: [String], default: [] },
    specializations: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const EnquirySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    source: { type: String, default: 'Website' },
    status: { type: String, enum: ['New', 'Contacted', 'Interested', 'Not Interested', 'Converted', 'Closed'], default: 'New' },
    notes: { type: String }
}, { timestamps: true });

// Create slug function
const createSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

// Sample Universities Data
const universitiesData = [
    {
        name: 'Amity University Online',
        shortName: 'Amity',
        slug: 'amity-university-online',
        logo: 'https://upload.wikimedia.org/wikipedia/en/5/5c/Amity_University_logo.png',
        banner: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200',
        description: 'Amity University is one of India\'s leading research and innovation-driven private universities. With a strong focus on quality education, Amity Online offers UGC-entitled online degree programs that are recognized globally. The university is known for its industry-aligned curriculum, experienced faculty, and state-of-the-art learning management system. Amity has produced over 150,000 alumni who are now working in top organizations across the globe.',
        establishedYear: 2005,
        location: 'Noida, Uttar Pradesh',
        address: 'Amity University Campus, Sector 125, Noida, UP 201313',
        website: 'https://www.amity.edu',
        email: 'info@amity.edu',
        phone: '+91-120-4392000',
        rating: 'A+',
        accreditations: ['NAAC A+', 'UGC-DEB', 'AICTE', 'WES'],
        approvals: ['UGC', 'AIU', 'ACU'],
        facilities: ['Digital Library', 'Virtual Labs', 'Placement Support', '24/7 Student Support', 'Industry Mentorship', 'Live Sessions'],
        highlights: ['40+ Online Programs', 'Global Recognition', '1000+ Industry Partners', 'Flexible Learning', 'EMI Options Available', 'Dedicated Placement Cell'],
        featured: true,
        isActive: true
    },
    {
        name: 'Manipal University Jaipur',
        shortName: 'MUJ',
        slug: 'manipal-university-jaipur',
        logo: 'https://upload.wikimedia.org/wikipedia/en/6/6f/Manipal_University_Jaipur_logo.png',
        banner: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
        description: 'Manipal University Jaipur is a premier institution offering world-class online education. Part of the prestigious Manipal Education Group, MUJ provides industry-relevant programs with a focus on practical learning and skill development. The university is known for its innovative teaching methodologies, strong placement record, and a legacy of academic excellence spanning over 6 decades.',
        establishedYear: 2011,
        location: 'Jaipur, Rajasthan',
        address: 'Dehmi Kalan, Jaipur-Ajmer Expressway, Jaipur, Rajasthan 303007',
        website: 'https://www.jaipur.manipal.edu',
        email: 'info@jaipur.manipal.edu',
        phone: '+91-141-3999100',
        rating: 'A+',
        accreditations: ['NAAC A+', 'UGC-DEB', 'AICTE'],
        approvals: ['UGC', 'AIU'],
        facilities: ['E-Library', 'Virtual Labs', 'Career Services', 'Alumni Network', 'Mentorship Program', 'Online Assessments'],
        highlights: ['Manipal Brand Legacy', 'Industry Partnerships', 'Global Alumni Network', 'Affordable Fees', 'Scholarship Available', '60+ Years Experience'],
        featured: true,
        isActive: true
    },
    {
        name: 'Lovely Professional University',
        shortName: 'LPU',
        slug: 'lovely-professional-university-online',
        logo: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Lovely_Professional_University_logo.png',
        banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
        description: 'Lovely Professional University is one of the largest single-campus universities in India. LPU Online offers a wide range of UGC-approved online degree programs designed to meet the needs of working professionals and students seeking flexible education options. With state-of-the-art infrastructure and a focus on holistic development, LPU has emerged as a leader in online education.',
        establishedYear: 2005,
        location: 'Phagwara, Punjab',
        address: 'Jalandhar-Delhi G.T. Road, Phagwara, Punjab 144411',
        website: 'https://www.lpu.in',
        email: 'info@lpu.in',
        phone: '+91-1824-517000',
        rating: 'A++',
        accreditations: ['NAAC A++', 'UGC-DEB', 'AICTE', 'NIRF'],
        approvals: ['UGC', 'AIU', 'ACU'],
        facilities: ['Digital Resources', 'Online Support', 'Placement Cell', 'Industry Connect', 'Student Portal', 'E-Content'],
        highlights: ['Largest University Campus', 'Top NIRF Rankings', '300+ Industry Tie-ups', 'International Collaborations', 'Affordable Education', 'Record Placements'],
        featured: true,
        isActive: true
    },
    {
        name: 'Chandigarh University Online',
        shortName: 'CU',
        slug: 'chandigarh-university-online',
        logo: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Chandigarh_University_Seal.png',
        banner: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1200',
        description: 'Chandigarh University is a NAAC A+ accredited university offering quality online education. CU Online provides flexible, industry-relevant programs designed to help students achieve their career goals while balancing work and personal commitments. The university is known for its strong industry connections and excellent placement record.',
        establishedYear: 2012,
        location: 'Mohali, Punjab',
        address: 'NH-95, Chandigarh-Ludhiana Highway, Mohali, Punjab 140413',
        website: 'https://www.cuchd.in',
        email: 'info@cuchd.in',
        phone: '+91-160-3051000',
        rating: 'A+',
        accreditations: ['NAAC A+', 'UGC-DEB', 'AICTE'],
        approvals: ['UGC', 'AIU'],
        facilities: ['Learning Management System', 'E-Resources', 'Career Guidance', 'Technical Support', 'Doubt Clearing Sessions', 'Mobile App'],
        highlights: ['Young & Dynamic University', 'Patent Filing Leader', 'Strong Industry Connect', 'Innovative Curriculum', 'Placement Assistance', 'Sports Excellence'],
        featured: true,
        isActive: true
    },
    {
        name: 'Jain University Online',
        shortName: 'Jain',
        slug: 'jain-university-online',
        logo: 'https://www.jainuniversity.ac.in/images/logo.png',
        banner: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200',
        description: 'Jain (Deemed-to-be University) is a premier institution in Bangalore offering comprehensive online programs. Known for its academic excellence and industry connections, Jain Online provides flexible learning solutions for aspiring professionals. The university has a strong focus on research, innovation, and entrepreneurship.',
        establishedYear: 1990,
        location: 'Bangalore, Karnataka',
        address: '44/4, District Fund Road, Jayanagar 9th Block, Bangalore 560069',
        website: 'https://www.jainuniversity.ac.in',
        email: 'info@jainuniversity.ac.in',
        phone: '+91-80-43430400',
        rating: 'A',
        accreditations: ['NAAC A', 'UGC-DEB', 'AICTE'],
        approvals: ['UGC', 'AIU'],
        facilities: ['Virtual Classrooms', 'Digital Library', 'Placement Support', 'Industry Webinars', 'Student Counseling', 'Alumni Connect'],
        highlights: ['30+ Years Legacy', 'Bangalore Location Advantage', 'Strong Alumni Network', 'Research Focus', 'Entrepreneurship Support', 'Sports Academy'],
        featured: false,
        isActive: true
    },
    {
        name: 'NMIMS Global Access',
        shortName: 'NMIMS',
        slug: 'nmims-global-access',
        logo: 'https://upload.wikimedia.org/wikipedia/en/d/d6/NMIMS_Logo.png',
        banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
        description: 'NMIMS Global Access School for Continuing Education offers high-quality distance and online learning programs. Part of the prestigious NMIMS University, it provides UGC-approved programs with a focus on industry relevance and practical learning. NMIMS has been consistently ranked among the top business schools in India.',
        establishedYear: 1981,
        location: 'Mumbai, Maharashtra',
        address: 'V.L. Mehta Road, Vile Parle West, Mumbai, Maharashtra 400056',
        website: 'https://www.nmims.edu',
        email: 'info@nmims.edu',
        phone: '+91-22-42355000',
        rating: 'A++',
        accreditations: ['NAAC A++', 'UGC-DEB', 'AICTE', 'AMBA'],
        approvals: ['UGC', 'AIU', 'AICTE'],
        facilities: ['Learning Management System', 'Digital Library', 'Career Services', 'Alumni Network', 'Industry Mentorship'],
        highlights: ['Top B-School in India', 'AMBA Accredited', 'Strong Alumni Network', 'Industry Partnerships', 'Mumbai Location', 'Research Excellence'],
        featured: true,
        isActive: true
    }
];

// Sample Programs Data
const programsData = [
    // MBA Programs
    {
        name: 'Master of Business Administration (MBA)',
        category: 'MBA',
        level: 'Postgraduate',
        duration: '2 Years',
        mode: 'Online',
        fee: 150000,
        feePeriod: 'Total',
        description: 'The Online MBA program is designed to develop future business leaders with a comprehensive understanding of management principles. This program covers core areas including marketing, finance, HR, operations, and strategy. Students gain practical skills through case studies, projects, and industry interactions. The curriculum is regularly updated to match industry requirements.',
        eligibility: 'Bachelor\'s degree in any discipline with minimum 50% marks',
        youtubeUrl: 'https://www.youtube.com/watch?v=QXeEoD0pB3E',
        highlights: ['Industry-Aligned Curriculum', 'Live Interactive Sessions', 'Case Study Approach', 'Capstone Project', 'Placement Assistance', 'Flexible Schedule'],
        syllabus: ['Management Principles', 'Financial Management', 'Marketing Management', 'Human Resource Management', 'Operations Management', 'Business Strategy', 'Business Analytics', 'Entrepreneurship', 'Corporate Governance', 'International Business'],
        careerOptions: ['Business Manager', 'Marketing Manager', 'Financial Analyst', 'HR Manager', 'Operations Manager', 'Business Consultant', 'Entrepreneur', 'Product Manager'],
        specializations: ['Marketing', 'Finance', 'Human Resources', 'Operations', 'Business Analytics', 'International Business', 'Entrepreneurship'],
        featured: true
    },
    {
        name: 'MBA in Finance',
        category: 'MBA',
        level: 'Postgraduate',
        duration: '2 Years',
        mode: 'Online',
        fee: 175000,
        feePeriod: 'Total',
        description: 'Specialized MBA program focusing on financial management, investment analysis, and corporate finance. This program prepares students for leadership roles in the financial sector with in-depth knowledge of financial markets, risk management, and strategic financial planning. Bloomberg Terminal training included.',
        eligibility: 'Bachelor\'s degree with minimum 50% marks',
        youtubeUrl: 'https://www.youtube.com/watch?v=Hy6FKpZTiRo',
        highlights: ['Finance Specialization', 'Bloomberg Terminal Access', 'Financial Modeling', 'Investment Analysis', 'Industry Mentors', 'CFA Preparation'],
        syllabus: ['Corporate Finance', 'Investment Management', 'Financial Markets', 'Risk Management', 'Mergers & Acquisitions', 'Financial Analytics', 'International Finance', 'Derivatives', 'Portfolio Management', 'Fintech'],
        careerOptions: ['Finance Manager', 'Investment Banker', 'Financial Analyst', 'Risk Manager', 'CFO', 'Portfolio Manager', 'Treasury Manager', 'Credit Analyst'],
        specializations: ['Corporate Finance', 'Investment Banking', 'Risk Management', 'Fintech'],
        featured: true
    },
    {
        name: 'MBA in Marketing',
        category: 'MBA',
        level: 'Postgraduate',
        duration: '2 Years',
        mode: 'Online',
        fee: 165000,
        feePeriod: 'Total',
        description: 'This MBA program specializes in marketing management, digital marketing, and brand management. Students learn to develop marketing strategies, understand consumer behavior, and leverage digital platforms for business growth. The program includes hands-on projects with real brands.',
        eligibility: 'Bachelor\'s degree with minimum 50% marks',
        youtubeUrl: 'https://www.youtube.com/watch?v=9LlM5cD8Nww',
        highlights: ['Digital Marketing Focus', 'Brand Management', 'Marketing Analytics', 'Live Projects', 'Industry Exposure', 'Google Certification'],
        syllabus: ['Marketing Management', 'Consumer Behavior', 'Digital Marketing', 'Brand Management', 'Marketing Research', 'Sales Management', 'Advertising', 'Social Media Marketing', 'Content Marketing', 'Marketing Analytics'],
        careerOptions: ['Marketing Manager', 'Brand Manager', 'Digital Marketing Manager', 'Sales Director', 'Product Manager', 'Market Research Analyst', 'Advertising Manager'],
        specializations: ['Digital Marketing', 'Brand Management', 'Sales Management', 'Marketing Analytics'],
        featured: true
    },
    {
        name: 'MBA in Human Resource Management',
        category: 'MBA',
        level: 'Postgraduate',
        duration: '2 Years',
        mode: 'Online',
        fee: 160000,
        feePeriod: 'Total',
        description: 'Specialized MBA focusing on human resource management, organizational behavior, and talent management. This program prepares students for HR leadership roles with expertise in recruitment, employee development, compensation, and HR analytics.',
        eligibility: 'Bachelor\'s degree with minimum 50% marks',
        youtubeUrl: 'https://www.youtube.com/watch?v=6vPGBWyMwOA',
        highlights: ['HR Specialization', 'SAP HR Training', 'HR Analytics', 'Live Case Studies', 'Industry Projects', 'SHRM Aligned'],
        syllabus: ['Human Resource Management', 'Organizational Behavior', 'Talent Acquisition', 'Performance Management', 'Compensation & Benefits', 'HR Analytics', 'Employment Law', 'Learning & Development', 'HR Strategy'],
        careerOptions: ['HR Manager', 'Talent Acquisition Manager', 'Learning & Development Manager', 'Compensation Manager', 'HR Business Partner', 'CHRO', 'HR Consultant'],
        specializations: ['Talent Management', 'HR Analytics', 'Organizational Development'],
        featured: false
    },
    // MCA Programs
    {
        name: 'Master of Computer Applications (MCA)',
        category: 'MCA',
        level: 'Postgraduate',
        duration: '2 Years',
        mode: 'Online',
        fee: 120000,
        feePeriod: 'Total',
        description: 'The MCA program provides comprehensive training in computer applications, software development, and IT management. Students learn programming languages, database management, web development, and emerging technologies. The program includes hands-on projects and industry certifications.',
        eligibility: 'Bachelor\'s degree with Mathematics/Computer Science or BCA',
        youtubeUrl: 'https://www.youtube.com/watch?v=AdWjBk82KCA',
        highlights: ['Industry-Ready Curriculum', 'Hands-on Projects', 'Latest Technologies', 'Coding Bootcamps', 'Tech Company Placements', 'AWS/Azure Certification'],
        syllabus: ['Data Structures & Algorithms', 'Database Management Systems', 'Web Technologies', 'Software Engineering', 'Cloud Computing', 'Machine Learning', 'Cybersecurity', 'Mobile App Development', 'DevOps', 'AI Fundamentals'],
        careerOptions: ['Software Developer', 'Web Developer', 'System Analyst', 'Database Administrator', 'IT Manager', 'Cloud Engineer', 'Data Scientist', 'Full Stack Developer'],
        specializations: ['Software Development', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'AI/ML'],
        featured: true
    },
    {
        name: 'MCA in Data Science',
        category: 'MCA',
        level: 'Postgraduate',
        duration: '2 Years',
        mode: 'Online',
        fee: 140000,
        feePeriod: 'Total',
        description: 'Specialized MCA program focusing on data science, machine learning, and big data analytics. Students learn Python, R, SQL, and various ML frameworks. The program includes capstone projects using real-world datasets.',
        eligibility: 'Bachelor\'s degree with Mathematics/Statistics background',
        youtubeUrl: 'https://www.youtube.com/watch?v=X3paOmcrTjQ',
        highlights: ['Data Science Focus', 'Python & R Programming', 'Machine Learning', 'Big Data Technologies', 'Industry Projects', 'Kaggle Competitions'],
        syllabus: ['Python Programming', 'Statistics for Data Science', 'Machine Learning', 'Deep Learning', 'Big Data Analytics', 'Data Visualization', 'NLP', 'Computer Vision', 'Time Series Analysis', 'MLOps'],
        careerOptions: ['Data Scientist', 'Machine Learning Engineer', 'Data Analyst', 'AI Engineer', 'Business Intelligence Analyst', 'Research Scientist'],
        specializations: ['Machine Learning', 'Deep Learning', 'Big Data', 'NLP'],
        featured: true
    },
    // BBA Programs
    {
        name: 'Bachelor of Business Administration (BBA)',
        category: 'BBA',
        level: 'Undergraduate',
        duration: '3 Years',
        mode: 'Online',
        fee: 90000,
        feePeriod: 'Total',
        description: 'The BBA program provides a strong foundation in business management principles. Students learn essential skills in marketing, finance, HR, and operations, preparing them for entry-level management positions or further studies like MBA.',
        eligibility: '10+2 or equivalent with minimum 50% marks',
        youtubeUrl: 'https://www.youtube.com/watch?v=JRWjNqhVqDY',
        highlights: ['Foundation in Business', 'Practical Learning', 'Industry Visits', 'Soft Skills Training', 'Internship Opportunities', 'MBA Foundation'],
        syllabus: ['Principles of Management', 'Business Communication', 'Financial Accounting', 'Marketing Basics', 'Organizational Behavior', 'Business Law', 'Entrepreneurship', 'Business Economics', 'Business Statistics'],
        careerOptions: ['Management Trainee', 'Business Analyst', 'Sales Executive', 'HR Assistant', 'Marketing Coordinator', 'Operations Associate', 'Entrepreneur'],
        specializations: ['Marketing', 'Finance', 'Human Resources', 'International Business'],
        featured: false
    },
    // BCA Programs
    {
        name: 'Bachelor of Computer Applications (BCA)',
        category: 'BCA',
        level: 'Undergraduate',
        duration: '3 Years',
        mode: 'Online',
        fee: 85000,
        feePeriod: 'Total',
        description: 'BCA program provides foundational knowledge in computer applications and programming. Students learn various programming languages, web development, database management, and software development concepts. Perfect stepping stone for MCA.',
        eligibility: '10+2 with Mathematics/Computer Science or equivalent',
        youtubeUrl: 'https://www.youtube.com/watch?v=7JyZwxXhvFY',
        highlights: ['Programming Fundamentals', 'Web Development', 'Database Skills', 'Project Work', 'Industry Certification', 'MCA Ready'],
        syllabus: ['Programming in C', 'Data Structures', 'DBMS', 'Web Technologies', 'Java Programming', 'Python', 'Software Engineering', 'Computer Networks', 'Operating Systems'],
        careerOptions: ['Junior Developer', 'Web Developer', 'Technical Support', 'System Administrator', 'IT Coordinator', 'QA Tester'],
        specializations: ['Web Development', 'Mobile App Development', 'Database Management'],
        featured: true
    },
    // B.Com Programs
    {
        name: 'Bachelor of Commerce (B.Com)',
        category: 'B.Com',
        level: 'Undergraduate',
        duration: '3 Years',
        mode: 'Online',
        fee: 60000,
        feePeriod: 'Total',
        description: 'B.Com program provides comprehensive knowledge of commerce, accounting, and business principles. Students develop skills in financial accounting, taxation, business law, and economic principles. Ideal for those pursuing careers in accounting and finance.',
        eligibility: '10+2 or equivalent with minimum 45% marks',
        youtubeUrl: 'https://www.youtube.com/watch?v=LPZWrK9aSb0',
        highlights: ['Commerce Foundation', 'Accounting Skills', 'Taxation Knowledge', 'Business Law', 'Practical Training', 'CA/CMA Foundation'],
        syllabus: ['Financial Accounting', 'Cost Accounting', 'Business Economics', 'Business Law', 'Taxation', 'Auditing', 'Corporate Accounting', 'Management Accounting', 'Business Mathematics'],
        careerOptions: ['Accountant', 'Tax Consultant', 'Audit Assistant', 'Banking Professional', 'Finance Executive', 'Business Analyst'],
        specializations: ['Accounting', 'Taxation', 'Banking', 'Finance'],
        featured: false
    },
    // M.Com Programs
    {
        name: 'Master of Commerce (M.Com)',
        category: 'M.Com',
        level: 'Postgraduate',
        duration: '2 Years',
        mode: 'Online',
        fee: 80000,
        feePeriod: 'Total',
        description: 'M.Com program offers advanced knowledge in commerce, accounting, and financial management. Students gain expertise in advanced accounting, research methodology, and specialized areas of commerce. Ideal for those seeking academic or senior finance roles.',
        eligibility: 'B.Com or equivalent degree with minimum 50% marks',
        youtubeUrl: 'https://www.youtube.com/watch?v=3tYb8l2Oqzw',
        highlights: ['Advanced Commerce', 'Research Skills', 'Specialization Options', 'Industry Projects', 'Academic Excellence', 'PhD Ready'],
        syllabus: ['Advanced Accounting', 'Financial Management', 'Research Methodology', 'Corporate Governance', 'E-Commerce', 'International Business', 'Strategic Management', 'Advanced Auditing'],
        careerOptions: ['Senior Accountant', 'Financial Controller', 'Business Analyst', 'Academic Professional', 'Research Analyst', 'CFO'],
        specializations: ['Accounting', 'Finance', 'E-Commerce', 'Taxation'],
        featured: false
    },
    // BA Programs
    {
        name: 'Bachelor of Arts (BA)',
        category: 'BA',
        level: 'Undergraduate',
        duration: '3 Years',
        mode: 'Online',
        fee: 45000,
        feePeriod: 'Total',
        description: 'The BA program offers a broad liberal arts education covering humanities, social sciences, and languages. Students develop critical thinking, communication, and analytical skills valued across industries.',
        eligibility: '10+2 or equivalent with minimum 45% marks',
        youtubeUrl: 'https://www.youtube.com/watch?v=W9oNRY7kPjA',
        highlights: ['Liberal Arts Education', 'Multiple Specializations', 'Critical Thinking', 'Communication Skills', 'Flexible Career Options'],
        syllabus: ['English Literature', 'Political Science', 'Economics', 'Psychology', 'Sociology', 'History', 'Philosophy', 'Geography'],
        careerOptions: ['Content Writer', 'Journalist', 'HR Executive', 'Social Worker', 'Public Relations', 'Administrative Officer'],
        specializations: ['English', 'Political Science', 'Economics', 'Psychology', 'Sociology'],
        featured: false
    },
    // MA Programs
    {
        name: 'Master of Arts in Economics (MA Economics)',
        category: 'MA',
        level: 'Postgraduate',
        duration: '2 Years',
        mode: 'Online',
        fee: 70000,
        feePeriod: 'Total',
        description: 'MA Economics provides advanced understanding of economic theories, policies, and quantitative methods. Students develop expertise in microeconomics, macroeconomics, econometrics, and policy analysis.',
        eligibility: 'Bachelor\'s degree with Economics or related field',
        youtubeUrl: 'https://www.youtube.com/watch?v=XZuRXN5tZkI',
        highlights: ['Economic Theory', 'Policy Analysis', 'Econometrics', 'Research Skills', 'Government Jobs Ready'],
        syllabus: ['Microeconomic Theory', 'Macroeconomic Theory', 'Econometrics', 'Development Economics', 'International Economics', 'Public Economics', 'Financial Economics'],
        careerOptions: ['Economist', 'Policy Analyst', 'Research Analyst', 'Government Officer', 'Banking Professional', 'Consultant'],
        specializations: ['Development Economics', 'Financial Economics', 'Public Policy'],
        featured: false
    }
];

// Sample Enquiries Data
const enquiriesData = [
    {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@gmail.com',
        phone: '+91-9876543210',
        message: 'I am interested in the MBA program. Please provide more details about the fee structure and admission process.',
        source: 'Website',
        status: 'New'
    },
    {
        name: 'Priya Patel',
        email: 'priya.patel@yahoo.com',
        phone: '+91-9876543211',
        message: 'Looking for information about MCA program. Is there any scholarship available?',
        source: 'Contact Form',
        status: 'Contacted'
    },
    {
        name: 'Amit Kumar',
        email: 'amit.kumar@hotmail.com',
        phone: '+91-9876543212',
        message: 'Want to know about BBA admission for the upcoming session.',
        source: 'Program Page',
        status: 'Interested'
    },
    {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@gmail.com',
        phone: '+91-9876543213',
        message: 'Please call me regarding MBA Finance program details.',
        source: 'Enrollment Form',
        status: 'New'
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.singh@outlook.com',
        phone: '+91-9876543214',
        message: 'Interested in BCA program. What are the career opportunities after completion?',
        source: 'University Page',
        status: 'New'
    },
    {
        name: 'Ananya Gupta',
        email: 'ananya.gupta@gmail.com',
        phone: '+91-9876543215',
        message: 'I want to pursue MCA in Data Science. Please share the curriculum.',
        source: 'Course Finder',
        status: 'Interested'
    },
    {
        name: 'Karthik Nair',
        email: 'karthik.nair@gmail.com',
        phone: '+91-9876543216',
        message: 'Looking for MBA with HR specialization. What is the duration and fee?',
        source: 'Enrollment Form',
        status: 'Contacted'
    }
];

// Main seeding function
const seedDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        console.log('URI:', MONGODB_URI);
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Create models
        const University = mongoose.model('University', UniversitySchema);
        const Program = mongoose.model('Program', ProgramSchema);
        const Enquiry = mongoose.model('Enquiry', EnquirySchema);

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await University.deleteMany({});
        await Program.deleteMany({});
        await Enquiry.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Insert Universities
        console.log('📦 Inserting universities...');
        const insertedUniversities = await University.insertMany(universitiesData);
        console.log(`✅ ${insertedUniversities.length} universities inserted\n`);

        // Insert Programs (distribute among universities)
        console.log('📦 Inserting programs...');
        const programsToInsert = [];
        
        for (let i = 0; i < programsData.length; i++) {
            const program = { ...programsData[i] };
            // Distribute programs among universities
            const universityIndex = i % insertedUniversities.length;
            program.universityId = insertedUniversities[universityIndex]._id;
            program.slug = createSlug(program.name) + '-' + Math.random().toString(36).substring(2, 7);
            programsToInsert.push(program);
        }

        // Also add some programs to multiple universities for variety
        for (let i = 0; i < 3; i++) {
            const program = { ...programsData[i] };
            const randomUniIndex = Math.floor(Math.random() * insertedUniversities.length);
            program.universityId = insertedUniversities[randomUniIndex]._id;
            program.slug = createSlug(program.name) + '-' + Math.random().toString(36).substring(2, 7);
            program.name = program.name + ' (Executive)';
            program.fee = program.fee * 1.2;
            programsToInsert.push(program);
        }

        const insertedPrograms = await Program.insertMany(programsToInsert);
        console.log(`✅ ${insertedPrograms.length} programs inserted\n`);

        // Update university fee ranges
        console.log('💰 Updating university fee ranges...');
        for (const university of insertedUniversities) {
            const programs = await Program.find({ universityId: university._id });
            if (programs.length > 0) {
                const fees = programs.map(p => p.fee);
                await University.findByIdAndUpdate(university._id, {
                    minFee: Math.min(...fees),
                    maxFee: Math.max(...fees)
                });
            }
        }
        console.log('✅ Fee ranges updated\n');

        // Insert Enquiries
        console.log('📦 Inserting enquiries...');
        const enquiriesToInsert = enquiriesData.map((enq, i) => ({
            ...enq,
            programId: insertedPrograms[i % insertedPrograms.length]._id,
            universityId: insertedUniversities[i % insertedUniversities.length]._id
        }));
        
        const insertedEnquiries = await Enquiry.insertMany(enquiriesToInsert);
        console.log(`✅ ${insertedEnquiries.length} enquiries inserted\n`);

        // Summary
        console.log('========================================');
        console.log('🎉 DATABASE SEEDING COMPLETED!');
        console.log('========================================');
        console.log(`📊 Universities: ${insertedUniversities.length}`);
        console.log(`📊 Programs: ${insertedPrograms.length}`);
        console.log(`📊 Enquiries: ${insertedEnquiries.length}`);
        console.log('========================================\n');

        // Display sample data
        console.log('📋 Universities:');
        insertedUniversities.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.name} (${u.location}) - ${u.rating}`);
        });

        console.log('\n📋 Featured Programs:');
        insertedPrograms.filter(p => p.featured).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} - ₹${p.fee.toLocaleString()}`);
        });

        console.log('\n✅ You can now start the application and see the data!');
        console.log('   Frontend: http://localhost:5173');
        console.log('   Admin: http://localhost:5173/admin/login');
        console.log('   Credentials: admin@edufolio.com / admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding
seedDatabase();