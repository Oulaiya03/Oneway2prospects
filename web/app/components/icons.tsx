import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Calendar = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg>
);
export const MapPin = (p: P) => (
  <svg {...base} {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const Mail = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
);
export const Phone = (p: P) => (
  <svg {...base} {...p}><path d="M5 4h3.5l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L15 17l4 1.5V22a1 1 0 0 1-1 1A17 17 0 0 1 4 6a1 1 0 0 1 1-1Z" /></svg>
);
export const Check = (p: P) => (
  <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7" /></svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const Play = (p: P) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
);
export const Building = (p: P) => (
  <svg {...base} {...p}><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 21V10h4a1 1 0 0 1 1 1v10M2 21h20M7.5 8h3M7.5 12h3M7.5 16h3" /></svg>
);
export const Target = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
);
export const Signal = (p: P) => (
  <svg {...base} {...p}><path d="M4 20a16 16 0 0 1 16 0M7.5 20a9 9 0 0 1 9 0" /><circle cx="12" cy="19.5" r="1.4" fill="currentColor" stroke="none" /></svg>
);
export const Route = (p: P) => (
  <svg {...base} {...p}><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8 16.5c6-1 8-3 8-8M9 6H6.5A2.5 2.5 0 0 0 4 8.5" /></svg>
);
export const Spark = (p: P) => (
  <svg {...base} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M17.7 6.3l-2.5 2.5M8.8 15.2l-2.5 2.5" /></svg>
);
export const Bolt = (p: P) => (
  <svg {...base} {...p}><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" /></svg>
);
export const Lock = (p: P) => (
  <svg {...base} {...p}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
);
export const Refresh = (p: P) => (
  <svg {...base} {...p}><path d="M4 12a8 8 0 0 1 13.5-5.8L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.5 5.8L4 16M4 20v-4h4" /></svg>
);
export const Linkedin = (p: P) => (
  <svg {...base} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M8 10.5V16M8 7.5v.01M12 16v-3a2 2 0 0 1 4 0v3M12 16v-5.5" /></svg>
);
export const Clock = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></svg>
);
export const Grid = (p: P) => (
  <svg {...base} {...p}><path d="M4 4h16v16H4zM4 12h16M12 4v16" /></svg>
);
export const Branch = (p: P) => (
  <svg {...base} {...p}><circle cx="6" cy="5" r="2.2" /><circle cx="18" cy="12" r="2.2" /><circle cx="6" cy="19" r="2.2" /><path d="M6 7.2v9.6M8.2 5.6c6 0.4 7.6 2 7.8 6M8 18.2c5-.3 7.2-1.6 7.8-4.4" /></svg>
);
export const ChevronRight = (p: P) => (
  <svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>
);
export const Users = (p: P) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 6.5a3 3 0 0 1 0 6M17 20a5.5 5.5 0 0 0-2.5-4.6" /></svg>
);
export const Square = (p: P) => (
  <svg {...base} {...p}><rect x="4" y="4" width="16" height="16" rx="4" /></svg>
);
export const CheckSquare = (p: P) => (
  <svg {...base} {...p} fill="none"><rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" stroke="currentColor" /><path d="m8 12 2.5 2.5L16 9" stroke="#fbfaf6" /></svg>
);
export const ExternalLink = (p: P) => (
  <svg {...base} {...p}><path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" /></svg>
);
export const TrendingUp = (p: P) => (
  <svg {...base} {...p}><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg>
);
export const Layers = (p: P) => (
  <svg {...base} {...p}><path d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 17l9 5 9-5" /></svg>
);
export const Send = (p: P) => (
  <svg {...base} {...p}><path d="M21 4 3 11l7 3 3 7 8-17ZM10 14l4-4" /></svg>
);
export const Calendar2 = (p: P) => (
  <svg {...base} {...p}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
export const Home = (p: P) => (
  <svg {...base} {...p}><path d="M4 11l8-7 8 7M6 9.5V20h12V9.5" /></svg>
);
export const Inbox = (p: P) => (
  <svg {...base} {...p}><path d="M4 13h4l1.5 3h5L16 13h4M4 13l2.5-8h11L20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /></svg>
);
export const BarChart = (p: P) => (
  <svg {...base} {...p}><path d="M4 20V4M4 20h16M8 20v-6M13 20V9M18 20v-9" /></svg>
);
export const Reply = (p: P) => (
  <svg {...base} {...p}><path d="M9 7 4 12l5 5M4 12h9a6 6 0 0 1 6 6v1" /></svg>
);
export const FileText = (p: P) => (
  <svg {...base} {...p}><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 13h6M9 17h6M9 9h1" /></svg>
);
export const Download = (p: P) => (
  <svg {...base} {...p}><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" /></svg>
);
export const MessageCircle = (p: P) => (
  <svg {...base} {...p}><path d="M4 12a8 8 0 1 1 3.5 6.6L4 20l1.4-3.5A8 8 0 0 1 4 12Z" /></svg>
);
export const Volume = (p: P) => (
  <svg {...base} {...p}><path d="M4 9v6h4l5 4V5L8 9H4ZM16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" /></svg>
);
export const Lightbulb = (p: P) => (
  <svg {...base} {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3Z" /></svg>
);
export const Video = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>
);
