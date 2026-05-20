export type ProjectStatus = "Active" | "Completed" | "On Hold";
export type ProjectFilter = "all" | ProjectStatus;


export type Participant = {
  user: string;          // userId ya username
  role: string;          // role in project (e.g., "developer", "designer")
  responsibility: string; // task responsibility
};

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;       // 0–100
  manager: string;
  teamCount: number;
  dueDate: string;
  startDate?: string;     // optional start date
  endDate?: string;       // optional end date
  domain?: string;        // optional domain
  customDomain?: string;  // optional custom domain
  description?: string;   // optional description
  participants?: Participant[]; // optional participants array
};