// Portfolio content, taken from Manan's resume.

export const profile = {
  name: "Manan Batra",
  role: "AI Software Engineer",
  tagline: "I build ML systems and the software around them.",
  location: "Tempe, AZ",
  email: "mananbatra2003.mb@gmail.com",
  // TODO: fill in real profile links.
  github: "https://github.com/mananbatraa",
  linkedin: "",
  // Drop a PDF into public/ and set its path here to show a download button.
  resume: "",
  // Your LinkedIn profile photo, shown on the Professional page. Save it as
  // public/professional/linkedin.jpg and set "/professional/linkedin.jpg". Empty shows your initials.
  photo: "",
  summary:
    "I'm doing my MS in CS at Arizona State, and I spent this summer as an AI engineering intern at ParentSquare. Most of what I build is ML pipelines, Kafka streaming systems and, lately, AI agents.",
};

// The floating music player. Either a path to an audio file in public/
// (e.g. "/music/track.mp3", shown as just a waves icon), or a YouTube or
// Spotify link (shown as a small embedded player card).
// YouTube plays the full song for everyone; Spotify gives logged-out
// visitors a 30-second preview. Leave empty to hide the player.
export const music = {
  // Royalty-free under the Pixabay Content License.
  title: "Elevation",
  artist: "Jonas Blakewood",
  url: "/music/elevation.mp3",
};

export const skills = [
  { group: "Languages", items: ["Python", "Go", "Java", "C", "C++", "SQL", "JavaScript", "TypeScript"] },
  {
    group: "Machine learning",
    items: ["Scikit-learn", "XGBoost", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Feature engineering", "Recommendation systems"],
  },
  { group: "Backend & data", items: ["FastAPI", "Kafka", "Redis", "MongoDB", "PostgreSQL", "Docker", "Cadence"] },
  { group: "Frontend & tools", items: ["React", "Next.js", "Prometheus", "Grafana", "Power BI", "UiPath", "Git"] },
];

type Job = {
  company: string;
  role: string;
  place: string;
  dates: string;
  stat: { value: string; label: string };
  // Short lines for the home page cards.
  points: string[];
  // Full resume bullets for the Professional page.
  details: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    company: "ParentSquare",
    role: "AI Software Engineering Intern",
    place: "Goleta, CA",
    dates: "Jun 2026 – Aug 2026",
    stat: { value: "62%", label: "less render-blocking JS" },
    points: [
      "Built a ticket analytics app that uses Gemini to make sense of support tickets.",
      "Found duplicate ticket categories with embeddings: 0.93 F1, no false positives.",
      "Wrote 34 Vitest tests and added role-based access across the app.",
    ],
    details: [
      "Built a ticket analytics app that uses Gemini to make sense of support tickets. React and TypeScript on the front, Python, FastAPI and PostgreSQL behind it.",
      "Cut render-blocking JavaScript by 62% by splitting the code per route and loading the rest later.",
      "Tested an embedding-based way to catch duplicate categories in the ticket taxonomy: 0.93 F1, 1.00 precision, 0.88 recall.",
      "Wrote 34 Vitest unit tests and added role-based access control on both the frontend and the backend."
    ],
    stack: ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Gemini", "Vitest"],
  },
  {
    company: "Buntikki",
    role: "AI/Software Intern",
    place: "Delhi, India",
    dates: "Jan 2025 – Apr 2025",
    stat: { value: "10k+", label: "vehicles routed per day" },
    points: [
      "Parking guidance for huge events like Kumbh Mela.",
      "Drivers spent about 25–30% less time looking for a spot.",
      "Routes updated from live parking data, and traffic flowed 20% better.",
    ],
    details: [
      "Built a parking guidance system for huge events like Kumbh Mela. It routed more than 10,000 vehicles a day.",
      "Smarter spot allocation and routing cut the time drivers spent looking for parking by about 25–30%.",
      "Routes updated from live parking availability, which improved traffic flow by 20%.",
      "Built it for dense crowds, so parking filled up more evenly and congestion dropped across zones."
    ],
    stack: ["Python", "Routing", "Real-time data"],
  },
  {
    company: "StarWire",
    role: "Software Intern",
    place: "Faridabad, India",
    dates: "Aug 2023 – Sep 2023",
    stat: { value: "20%", label: "faster ticket response" },
    points: [
      "A MERN CRM for 100+ users, with automatic ticket sorting.",
      "Dashboards for user and ticket data.",
      "UiPath bots for financial data, with 30% less manual work.",
    ],
    details: [
      "Built a MERN CRM used by 100+ people for internal support.",
      "Added automatic ticket categories and priorities, which cut response time by 20%.",
      "Built reporting dashboards for user and ticket data.",
      "Automated financial data processing with UiPath, which cut manual work by 30%."
    ],
    stack: ["MongoDB", "Express", "React", "Node.js", "UiPath"],
  },
];

type Project = {
  name: string;
  stack: string[];
  summary: string;
  href: string;
  // Live demo URL. Empty string shows a "coming soon" note; leave the key out to show nothing.
  demo?: string;
  // Short context line under the title, e.g. for team projects.
  note?: string;
  // Span two grid columns on desktop (the first project always does).
  wide?: boolean;
};

export const projects: Project[] = [
  {
    name: "ResearchPilot",
    stack: ["LangGraph", "Gemini", "FastAPI", "React", "TypeScript"],
    summary:
      "Four agents split the work. One searches the web, one weighs the evidence, one fact-checks it against the sources, and one writes the report. Every claim links back to where it came from.",
    href: "https://github.com/mananbatraa/researchpilot-ai",
    demo: "",
  },
  {
    name: "Code Repair Agent",
    stack: ["Python", "AST", "Claude API", "Pytest"],
    summary:
      "Scans Python code for common bugs and security holes. Simple ones get rule-based fixes, and Claude takes the rest. Every AI patch is checked against the file before it goes in the report, and it never touches your code.",
    href: "https://github.com/mananbatraa/autonomous-code-repair-agent",
  },
  {
    name: "Step Cards",
    note: "Team project for the North America AI Challenge 2026. I built the school and work mode UI.",
    stack: ["React", "TypeScript", "TanStack Start", "Supabase", "Groq"],
    summary:
      "A teacher says an instruction out loud and autistic and ADHD students get it as picture step cards, live. The teacher approves each card first, and the help fades as a routine sticks. Work mode does the same for neurodivergent adults with instructions from their manager.",
    href: "https://github.com/dgupta98/NueroChallange",
    demo: "https://nuero-challange.vercel.app",
    wide: true,
  },
  {
    name: "AnomalyScan",
    stack: ["Go", "Kafka", "MongoDB", "Prometheus", "Grafana"],
    summary: "Streams data in through Kafka, scores it with an ML model to catch anomalies as they happen, and shows it all in Grafana.",
    href: "",
  },
  {
    name: "LiveRank",
    stack: ["Python", "Kafka", "Redis", "MongoDB"],
    summary: "A live leaderboard. Scores come in over Kafka, Redis sorted sets do the ranking, and MongoDB keeps the record.",
    href: "",
  },
  {
    name: "OptiQueue",
    stack: ["Go", "Uber Cadence"],
    summary: "A task queue on Uber Cadence that schedules work by priority, dependencies and free resources.",
    href: "",
  },
];

export const research = {
  title: "Early learning disability detection",
  stack: ["Python", "Scikit-learn", "XGBoost"],
  summary:
    "Can a model spot a learning disability early? I built a pipeline on educational and health data, trimmed the features with PCA and RFE, and tuned Random Forest, SVM, XGBoost and a neural net. Random Forest won.",
  stats: [
    { value: "93.83%", label: "accuracy" },
    { value: "0.9619", label: "ROC-AUC" },
    { value: "4", label: "model families compared" },
  ],
};

export const education = [
  { school: "Arizona State University", degree: "MS in Computer Science", dates: "2025 – present", place: "Tempe, AZ" },
  { school: "Vellore Institute of Technology", degree: "BTech, CS and Business Systems", dates: "2021 – 2025", place: "Vellore, India" },
];

// Headline numbers from the resume, shown as count-up cards on the Professional page.
export const achievements = [
  { value: 62, suffix: "%", label: "less render-blocking JavaScript", source: "ParentSquare" },
  { value: 0.93, decimals: 2, label: "F1 catching duplicate ticket categories, with no false positives", source: "ParentSquare" },
  { value: 10000, suffix: "+", label: "vehicles routed a day at Kumbh Mela-sized events", source: "Buntikki" },
  { value: 30, suffix: "%", label: "less time spent looking for parking", source: "Buntikki" },
  { value: 93.83, decimals: 2, suffix: "%", label: "accuracy spotting learning disabilities early", source: "Research" },
  { value: 20, suffix: "%", label: "faster replies to support tickets", source: "StarWire" },
];

// Certifications and awards. None are on the resume yet: add them here
// and a section appears on the Professional page automatically.
export const certifications: { name: string; issuer: string; year: string; href?: string }[] = [];
