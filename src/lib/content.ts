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
};

// The floating music player. Paste a YouTube or Spotify link to a track.
// YouTube plays the full song for everyone; Spotify gives logged-out
// visitors a 30-second preview. Leave empty to hide the player.
export const music = {
  title: "Loser",
  artist: "Tame Impala",
  url: "https://www.youtube.com/watch?v=LGLS4ARe-vw",
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

export const experience = [
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
  },
];

export const projects = [
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
  { school: "Arizona State University", degree: "MS in Computer Science", dates: "2025 – present" },
  { school: "Vellore Institute of Technology", degree: "BTech, CS and Business Systems", dates: "2021 – 2025" },
];
