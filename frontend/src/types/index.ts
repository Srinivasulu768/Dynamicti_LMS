/** Known system roles. Custom roles are also valid as any string. */
export type SystemRole = 'super_admin' | 'training_admin' | 'content_manager' | 'instructor' | 'org_admin' | 'learner';
export type Role = string;

/** Parent type for linking content/assessments/media/certificates to either a Course or Program */
export type ParentType = 'course' | 'program';

/** Workflow status for Courses and Programs */
export type WorkflowStatus = 'draft' | 'published' | 'archived';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
  organization?: string;
  organizationId?: string;
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  department?: string;
  joinDate: string;
  lastLogin?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorId: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: WorkflowStatus;
  enrollmentCount: number;
  capacity: number;
  price: number;
  thumbnail?: string;
  rating: number;
  modules: number;
  lessons: number;
  startDate: string;
  endDate: string;
  prerequisites?: string[];
  tags?: string[];
  /** Content manager assigned to build this course */
  assignedTo?: string;
  /** Date when course was published */
  publishedDate?: string;
}

export interface ProgramModule {
  id: string;
  title: string;
  lessons: ProgramLesson[];
}

export interface ProgramLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'document' | 'assignment' | 'quiz';
}

export interface ProgramSession {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  instructorName: string;
  capacity: number;
  attendees: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ProgramAssessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'exam';
  questions: number;
  duration: number;
  passingScore: number;
  attempts: number;
  status: 'draft' | 'published';
}

export interface ProgramMedia {
  id: string;
  title: string;
  type: 'video' | 'document' | 'image' | 'audio';
  url: string;
  size: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level?: string;
  status: WorkflowStatus;
  enrollmentCount: number;
  price: number;
  startDate: string;
  endDate: string;
  tags?: string[];
  modules: ProgramModule[];
  sessions: ProgramSession[];
  assessments: ProgramAssessment[];
  media: ProgramMedia[];
  /** Content manager assigned to build this program */
  assignedTo?: string;
  /** Date when program was published */
  publishedDate?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  industry: string;
  size: string;
  totalUsers: number;
  activeEnrollments: number;
  complianceRate: number;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  /** Reference to Course or Program */
  courseId: string;
  courseName: string;
  /** Whether this enrollment is for a course or program */
  parentType: ParentType;
  progress: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'waitlisted';
  enrolledDate: string;
  completedDate?: string;
  grade?: string;
}

export interface Session {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  capacity: number;
  attendees: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'invoice';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  description: string;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  /** Whether this certificate is for a course or program */
  parentType: ParentType;
  issueDate: string;
  expiryDate?: string;
  certificateNumber: string;
  status: 'active' | 'revoked' | 'expired';
  templateId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  date: string;
  userId?: string;
  route?: string;
}

export interface Assessment {
  id: string;
  title: string;
  /** Reference to Course or Program ID */
  courseId: string;
  courseName: string;
  /** Whether this assessment belongs to a course or program */
  parentType: ParentType;
  type: 'quiz' | 'assignment' | 'exam' | 'survey';
  questions: number;
  duration: number;
  passingScore: number;
  attempts: number;
  status: 'draft' | 'published' | 'archived';
}

/** Content items (modules, lessons, documents, videos) */
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  /** The type of content */
  contentType: 'module' | 'lesson' | 'video' | 'document' | 'pdf' | 'assignment';
  /** Parent entity type (course or program) */
  parentType: ParentType;
  /** Parent entity ID (courseId or programId) */
  parentId: string;
  /** Parent entity name for display */
  parentName: string;
  /** Module ID if this is a lesson belonging to a module */
  moduleId?: string;
  /** Order within the parent */
  order: number;
  /** Duration for videos/lessons */
  duration?: string;
  /** File format for documents */
  format?: string;
  status: 'draft' | 'published';
  createdBy?: string;
  createdDate: string;
  updatedDate: string;
}

/** Media Library items */
export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  /** File type */
  mediaType: 'video' | 'image' | 'pdf' | 'document' | 'audio';
  /** File URL/path */
  url: string;
  /** File size display string */
  size: string;
  /** Duration for video/audio */
  duration?: string;
  /** Category tag */
  category: string;
  /** Can be attached to course lessons or program lessons */
  parentType?: ParentType;
  parentId?: string;
  parentName?: string;
  status: 'draft' | 'published';
  uploadedBy?: string;
  uploadDate: string;
  views: number;
}

/** Certificate Template for configuration */
export interface CertificateTemplate {
  id: string;
  title: string;
  description?: string;
  /** Parent entity type */
  parentType: ParentType;
  /** Parent entity ID */
  parentId: string;
  parentName: string;
  /** Validity period in months (0 = no expiry) */
  validityMonths: number;
  status: 'active' | 'inactive';
  createdDate: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalOrganizations: number;
  totalSessions: number;
  revenue: number;
  certificatesIssued: number;
  activeInquiries: number;
  completionRate: number;
  averageRating: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: Role[];
  children?: SidebarItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}
