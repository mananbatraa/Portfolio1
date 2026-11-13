// Portfolio content, taken from Manan's resume.

export const profile = {
  name: "Manan Batra",
  role: "AI Software Engineer",
  tagline: "I build systems that learn, stream and scale.",
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
    "AI software engineer and MS CS student at Arizona State. I build ML pipelines, real-time streaming systems and agentic AI tools, and I like shipping them end to end.",
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
      "Built an AI ticket analytics platform with React, TypeScript, FastAPI, PostgreSQL and Gemini.",
      "Embedding-based duplicate taxonomy detection at 0.93 F1 and 1.00 precision.",
      "34 Vitest unit tests and role-based access control across frontend and backend.",
    ],
    details: [
      "Developed an AI-powered ticket analytics platform using React, TypeScript, Python, FastAPI, PostgreSQL and Gemini.",
      "Reduced render-blocking JavaScript by 62% through route-based code splitting and deferred loading.",
      "Evaluated embedding-based duplicate taxonomy detection, achieving 0.93 F1 with 1.00 precision and 0.88 recall.",
      "Built 34 Vitest unit tests and implemented role-based access control across frontend and backend workflows."
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
      "AI parking guidance for large events such as Kumbh Mela.",
      "Cut parking search time by about 25–30% with smarter allocation and routing.",
      "Real-time availability updates improved traffic flow by 20%.",
    ],
    details: [
      "Developed an AI-powered parking guidance system to optimize vehicle routing during large-scale events such as Kumbh Mela, handling 10,000+ vehicles a day.",
      "Reduced vehicle search time for parking by about 25–30% through intelligent parking allocation and routing strategies.",
      "Processed real-time parking availability data to update routes dynamically, improving overall traffic flow efficiency by 20%.",
      "Designed the system for high-density crowd scenarios, improving parking utilization and reducing congestion across multiple zones."
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
      "MERN CRM for 100+ users with smart ticket categorisation and priority.",
      "Reporting dashboards for user and ticket data.",
      "Automated financial processing with UiPath, cutting manual effort by 30%.",
    ],
    details: [
      "Developed a MERN-based CRM system supporting 100+ users, improving internal support workflows.",
      "Implemented intelligent ticket categorization and prioritization, reducing response time by 20%.",
      "Built data-driven reporting dashboards to analyze user and ticket data for better decisions.",
      "Automated financial data processing using UiPath, reducing manual effort by 30%."
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
};

export const projects: Project[] = [
  {
    name: "ResearchPilot",
    stack: ["LangGraph", "Gemini", "FastAPI", "React", "TypeScript"],
    summary:
      "A four-agent research assistant: one agent searches the web, one analyzes the evidence, one fact-checks it against the sources, and one writes a cited report you can verify claim by claim.",
    href: "https://github.com/mananbatraa/researchpilot-ai",
    demo: "",
  },
  {
    name: "Code Repair Agent",
    stack: ["Python", "AST", "Claude API", "Pytest"],
    summary:
      "Scans Python code for bug and security patterns, proposes rule-based fixes, and asks Claude for the rest. Every AI patch is checked against the file before it reaches the review report, and nothing is written back to the source.",
    href: "https://github.com/mananbatraa/autonomous-code-repair-agent",
  },
  {
    name: "AnomalyScan",
    stack: ["Go", "Kafka", "MongoDB", "Prometheus", "Grafana"],
    summary: "Real-time anomaly detection on a Kafka streaming pipeline, with ML scoring and live observability dashboards.",
    href: "",
  },
  {
    name: "LiveRank",
    stack: ["Python", "Kafka", "Redis", "MongoDB"],
    summary: "Real-time leaderboard using Kafka event streams and Redis sorted sets, kept consistent with MongoDB.",
    href: "",
  },
  {
    name: "OptiQueue",
    stack: ["Go", "Uber Cadence"],
    summary: "Priority queueing on Cadence workflows that schedules by priority, dependencies and available resources.",
    href: "",
  },
];

export const research = {
  title: "Early learning disability detection",
  stack: ["Python", "Scikit-learn", "XGBoost"],
  summary:
    "An end-to-end ML pipeline on educational and health data, using PCA, recursive feature elimination and grid-searched Random Forest, SVM, XGBoost and neural network models.",
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
  { value: 0.93, decimals: 2, label: "F1 on duplicate taxonomy detection (1.00 precision)", source: "ParentSquare" },
  { value: 10000, suffix: "+", label: "vehicles routed per day at Kumbh Mela scale", source: "Buntikki" },
  { value: 30, suffix: "%", label: "faster parking search through smarter allocation", source: "Buntikki" },
  { value: 93.83, decimals: 2, suffix: "%", label: "accuracy on early learning disability detection", source: "Research" },
  { value: 20, suffix: "%", label: "faster ticket response with smart prioritisation", source: "StarWire" },
];

// Certifications and awards. None are on the resume yet: add them here
// and a section appears on the Professional page automatically.
export const certifications: { name: string; issuer: string; year: string; href?: string }[] = [];
