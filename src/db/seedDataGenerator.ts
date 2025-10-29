import type { Job, Candidate, Assessment } from '../types';

// First names for candidates
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Jessica', 'Robert', 'Amanda',
  'William', 'Ashley', 'Richard', 'Stephanie', 'Joseph', 'Melissa', 'Thomas', 'Nicole', 'Charles', 'Elizabeth',
  'Christopher', 'Michelle', 'Daniel', 'Kimberly', 'Matthew', 'Amy', 'Anthony', 'Angela', 'Mark', 'Laura',
  'Donald', 'Lisa', 'Steven', 'Nancy', 'Paul', 'Karen', 'Andrew', 'Betty', 'Joshua', 'Helen',
  'Kenneth', 'Sandra', 'Kevin', 'Donna', 'Brian', 'Carol', 'George', 'Ruth', 'Timothy', 'Sharon',
  'Ronald', 'Michelle', 'Jason', 'Laura', 'Edward', 'Sarah', 'Jeffrey', 'Kimberly', 'Ryan', 'Deborah',
  'Jacob', 'Lisa', 'Gary', 'Susan', 'Nicholas', 'Dorothy', 'Eric', 'Nancy', 'Jonathan', 'Karen',
  'Stephen', 'Betty', 'Larry', 'Helen', 'Justin', 'Sandra', 'Scott', 'Donna', 'Brandon', 'Carol',
  'Raymond', 'Ruth', 'Frank', 'Sharon', 'Benjamin', 'Anna', 'Gregory', 'Emma', 'Samuel', 'Olivia',
  'Patrick', 'Cynthia', 'Alexander', 'Marie', 'Jack', 'Janet', 'Dennis', 'Catherine', 'Jerry', 'Frances',
  'Tyler', 'Christine', 'Aaron', 'Samantha', 'Jose', 'Debra', 'Henry', 'Rachel', 'Adam', 'Carolyn'
];

// Last names for candidates
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
  'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
  'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips',
  'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
  'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks',
  'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez',
  'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins',
  'Perry', 'Russell', 'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales', 'Fisher',
  'Vasquez', 'Simmons', 'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin',
  'Wallace', 'Moreno', 'West', 'Cole', 'Hayes', 'Bryant', 'Herrera', 'Gibson', 'Ellis', 'Tran',
  'Medina', 'Aguilar', 'Stevens', 'Murray', 'Ford', 'Castro', 'Marshall', 'Owens', 'Harrison', 'Fernandez',
  'Mcdonald', 'Woods', 'Washington', 'Kennedy', 'Wells', 'Vargas', 'Henry', 'Chen', 'Freeman', 'Webb',
  'Tucker', 'Guzman', 'Burns', 'Crawford', 'Olson', 'Simpson', 'Porter', 'Hunter', 'Gordon', 'Mendez',
  'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon', 'Munoz', 'Hunt', 'Hicks', 'Holmes', 'Palmer',
  'Wagner', 'Black', 'Robertson', 'Boyd', 'Rose', 'Stone', 'Salazar', 'Fox', 'Warren', 'Mills',
  'Meyer', 'Rice', 'Schmidt', 'Garza', 'Daniels', 'Ferguson', 'Nichols', 'Stephens', 'Soto', 'Wolfe',
  'Snyder', 'Barrett', 'Ryan', 'Gonzalez', 'Rivers', 'Jennings', 'Haynes', 'Padilla', 'Garza', 'Torres',
  'Flores', 'Navarro', 'Wells', 'Baldwin', 'Spencer', 'Cooper', 'Sharp', 'Houston', 'Wade', 'Mccoy',
  'Roy', 'Strickland', 'Brown', 'Delacruz', 'Lutz', 'Kelly', 'Kerr', 'Justice', 'Perez', 'Howell',
  'Arnold', 'Gray', 'Tapia', 'Valenzuela', 'Velez', 'Newton', 'Serrano', 'Hammond', 'Frost', 'Richards'
];

// Tech skills and job titles for realistic candidate data
const techSkills = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'Rust', 'PHP',
  'Angular', 'Vue.js', 'Next.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Svelte', 'Nuxt',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'GitHub Actions',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Cassandra', 'Neo4j', 'InfluxDB', 'DynamoDB', 'S3',
  'GraphQL', 'REST', 'gRPC', 'WebSocket', 'RabbitMQ', 'Kafka', 'Nginx', 'Apache', 'HAProxy', 'ELB'
];

const jobTitles = [
  'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer', 'Principal Engineer',
  'Frontend Developer', 'Senior Frontend Developer', 'Backend Developer', 'Senior Backend Developer',
  'Full Stack Developer', 'Senior Full Stack Developer', 'DevOps Engineer', 'Senior DevOps Engineer',
  'Cloud Engineer', 'Security Engineer', 'Data Engineer', 'ML Engineer', 'QA Engineer', 'SRE'
];

const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'company.com', 'tech.com', 'dev.io'];

// Generate a random job
function generateJob(id: number): Job {
  const jobTitles = [
    'Senior Frontend Developer', 'Backend Engineer', 'DevOps Engineer', 'Data Scientist', 'Product Manager',
    'UX Designer', 'QA Engineer', 'System Architect', 'Mobile Developer', 'Security Engineer',
    'Cloud Engineer', 'ML Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Senior Backend Engineer', 'Senior DevOps Engineer', 'React Developer', 'Node.js Developer', 'Python Developer',
    'Java Developer', 'Go Developer', 'Rust Developer', 'C++ Developer', 'Senior Data Engineer'
  ];
  
  const locations = ['San Francisco, CA', 'New York, NY', 'Remote', 'London, UK', 'Toronto, Canada', 'Austin, TX', 'Seattle, WA'];
  const statuses: ('active' | 'archived')[] = ['active', 'archived'];
  const techStacks = {
    'Senior Frontend Developer': ['React', 'TypeScript', 'Frontend', 'Next.js'],
    'Backend Engineer': ['Node.js', 'Python', 'Backend', 'API'],
    'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    'Data Scientist': ['Python', 'Machine Learning', 'Data Analysis'],
    'Product Manager': ['Product', 'Strategy', 'Agile'],
    'UX Designer': ['Design', 'UI/UX', 'Figma'],
    'QA Engineer': ['Testing', 'QA', 'Automation'],
    'System Architect': ['Architecture', 'System Design', 'Cloud'],
    'Mobile Developer': ['React Native', 'iOS', 'Android'],
    'Security Engineer': ['Security', 'Cyber Security', 'Penetration Testing']
  };
  
  const title = jobTitles[id % jobTitles.length];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: `job-${id}`,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    status,
    tags: techStacks[title as keyof typeof techStacks] || ['General'],
    order: id,
    description: `We are looking for a ${title} to join our team. This role requires expertise in modern technologies and best practices.`,
    requirements: [
      `${Math.floor(Math.random() * 10) + 2}+ years experience`,
      'Strong problem-solving skills',
      'Excellent communication abilities'
    ],
    location: locations[id % locations.length],
    salary: {
      min: 80000 + Math.floor(Math.random() * 100000),
      max: 150000 + Math.floor(Math.random() * 150000),
      currency: 'INR'
    },
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  };
}

// Generate a random candidate
function generateCandidate(id: number, jobIds: string[]): Candidate {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  const phone = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const jobId = jobIds[Math.floor(Math.random() * jobIds.length)];
  const stage = stages[Math.floor(Math.random() * stages.length)];
  
  const appliedDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
  const timeline = [
    { stage: 'applied', timestamp: appliedDate, note: 'Application submitted' }
  ];
  
  // Add timeline events based on stage
  if (stage !== 'applied') {
    timeline.push({ stage: 'screen', timestamp: new Date(appliedDate.getTime() + 2 * 24 * 60 * 60 * 1000), note: 'Phone screening completed' });
  }
  if (['tech', 'offer', 'hired'].includes(stage)) {
    timeline.push({ stage: 'tech', timestamp: new Date(appliedDate.getTime() + 5 * 24 * 60 * 60 * 1000), note: 'Technical interview scheduled' });
  }
  if (['offer', 'hired'].includes(stage)) {
    timeline.push({ stage: 'offer', timestamp: new Date(appliedDate.getTime() + 10 * 24 * 60 * 60 * 1000), note: 'Offer extended' });
  }
  if (stage === 'hired') {
    timeline.push({ stage: 'hired', timestamp: new Date(appliedDate.getTime() + 15 * 24 * 60 * 60 * 1000), note: 'Offer accepted' });
  }
  if (stage === 'rejected') {
    timeline.push({ stage: 'rejected', timestamp: new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000), note: 'Application rejected' });
  }
  
  const randomSkills = techSkills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3);
  
  return {
    id: `candidate-${id}`,
    name: `${firstName} ${lastName}`,
    email,
    stage,
    jobId,
    phone,
    resume: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_resume.pdf`,
    coverLetter: `I am excited to apply for this position. My background in ${randomSkills.join(', ')} makes me a strong candidate.`,
    notes: [
      `Strong experience in ${randomSkills[0]}`,
      stage !== 'applied' ? 'Initial screening completed' : 'Pending review'
    ],
    timeline,
    appliedAt: appliedDate,
    createdAt: appliedDate,
    updatedAt: new Date(timeline[timeline.length - 1].timestamp)
  };
}

// Generate assessment with 10+ questions
function generateAssessment(id: number, jobId: string, jobTitle: string): Assessment {
  const sections = [
    {
      id: `section-${id}-1`,
      title: 'Technical Fundamentals',
      questions: [
        {
          id: `q${id}-1`,
          type: 'single-choice' as const,
          question: 'What is the difference between let and const?',
          required: true,
          options: ['let allows reassignment, const does not', 'No difference', 'let is faster', 'const is deprecated']
        },
        {
          id: `q${id}-2`,
          type: 'multi-choice' as const,
          question: 'Which of the following are JavaScript features?',
          required: true,
          options: ['Arrow functions', 'Async/await', 'Promises', 'Type coercion']
        },
        {
          id: `q${id}-3`,
          type: 'short-text' as const,
          question: 'Explain what a closure is in JavaScript.',
          required: true,
          validation: { maxLength: 500 }
        },
        {
          id: `q${id}-4`,
          type: 'long-text' as const,
          question: 'Describe the event loop in JavaScript and how it handles asynchronous code.',
          required: true,
          validation: { maxLength: 1000 }
        },
        {
          id: `q${id}-5`,
          type: 'numeric' as const,
          question: 'What is the time complexity of binary search?',
          required: true,
          validation: { min: 0, max: 100 }
        }
      ]
    },
    {
      id: `section-${id}-2`,
      title: 'Framework Knowledge',
      questions: [
        {
          id: `q${id}-6`,
          type: 'single-choice' as const,
          question: 'What is the purpose of useEffect hook in React?',
          required: true,
          options: ['To manage side effects', 'To render components', 'To handle events', 'To fetch data']
        },
        {
          id: `q${id}-7`,
          type: 'multi-choice' as const,
          question: 'Which state management solutions are commonly used with React?',
          required: true,
          options: ['Redux', 'Context API', 'MobX', 'Zustand']
        },
        {
          id: `q${id}-8`,
          type: 'short-text' as const,
          question: 'Explain the concept of virtual DOM in React.',
          required: true,
          validation: { maxLength: 500 }
        },
        {
          id: `q${id}-9`,
          type: 'long-text' as const,
          question: 'Describe how you would optimize a React application for better performance.',
          required: true,
          validation: { maxLength: 1000 }
        },
        {
          id: `q${id}-10`,
          type: 'long-text' as const,
          question: 'Explain the difference between class components and functional components in React.',
          required: true,
          validation: { maxLength: 1000 }
        },
        {
          id: `q${id}-11`,
          type: 'short-text' as const,
          question: 'What is the difference between props and state?',
          required: true,
          validation: { maxLength: 300 }
        },
        {
          id: `q${id}-12`,
          type: 'short-text' as const,
          question: 'How would you implement code splitting in a React application?',
          required: true,
          validation: { maxLength: 500 }
        }
      ]
    },
    {
      id: `section-${id}-3`,
      title: 'Problem Solving',
      questions: [
        {
          id: `q${id}-13`,
          type: 'long-text' as const,
          question: 'Describe a challenging problem you have solved and how you approached it.',
          required: true,
          validation: { maxLength: 1000 }
        },
        {
          id: `q${id}-14`,
          type: 'short-text' as const,
          question: 'How do you stay updated with the latest technologies and best practices?',
          required: true,
          validation: { maxLength: 500 }
        }
      ]
    }
  ];

  return {
    id: `assessment-${id}`,
    jobId,
    title: `${jobTitle} Assessment`,
    description: `Comprehensive technical assessment for ${jobTitle} position`,
    sections,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  };
}

// Generate seed data
export function generateSeedData() {
  // Generate 25 jobs (mixed active/archived)
  const jobs: Job[] = [];
  for (let i = 1; i <= 25; i++) {
    jobs.push(generateJob(i));
  }
  
  // Generate 1000 candidates randomly assigned to jobs and stages
  const jobIds = jobs.map(job => job.id);
  const candidates: Candidate[] = [];
  for (let i = 1; i <= 1000; i++) {
    candidates.push(generateCandidate(i, jobIds));
  }
  
  // Generate 4 assessments with 10+ questions each
  const assessments: Assessment[] = [];
  const selectedJobIds = jobIds.slice(0, 4);
  selectedJobIds.forEach((jobId, index) => {
    const job = jobs.find(j => j.id === jobId);
    assessments.push(generateAssessment(index + 1, jobId, job?.title || 'Developer'));
  });
  
  return { jobs, candidates, assessments };
}

