export interface Student {
  id: number;
  regNo: string;
  name: string;
  email: string;
  phone: string | null;
  branch: string;
  cgpa: number;
  passoutYear: number;
  resumePath: string | null;
  createdAt?: Date | null;
}

export interface Company {
  id: number;
  name: string;
  roleTitle: string;
  description: string | null;
  ctc: number;
  location: string | null;
  cgpaCutoff: number;
  eligibleBranches: string;
  applicationDeadline: Date | null;
  createdAt?: Date | null;
}

export interface Application {
  id: number;
  studentId: number;
  companyId: number;
  status: "applied" | "shortlisted" | "selected" | "rejected";
  interviewScore: number | null;
  appliedAt: Date;
  student?: Student;
  company?: Company;
}

export interface Interview {
  id: number;
  studentId: number;
  companyId: number;
  date: Date;
  time: string;
  mode: string;
  link: string | null;
  status: string;
  student?: { name: string; regNo: string };
  company?: { name: string; roleTitle: string };
}

export interface Notification {
  id: number;
  userType: string;
  userId: number;
  message: string;
  status: "read" | "unread";
  createdAt: Date;
}

export interface Message {
  id: number;
  senderId: number;
  senderRole: "student" | "admin";
  receiverId: number;
  messageText: string;
  createdAt: Date;
}

export interface InterviewFeedback {
  id: number;
  studentId: number;
  companyId: number;
  technicalScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  improvementAreas: string | null;
  decision: string;
  company?: { name: string; roleTitle: string };
}

export const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE"] as const;
