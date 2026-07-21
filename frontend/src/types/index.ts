/** Known system roles. Custom roles are also valid as any string. */
export type SystemRole = 'super_admin' | 'training_admin' | 'content_manager' | 'instructor' | 'org_admin' | 'learner';
export type Role = string;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
  status: 'draft' | 'published' | 'archived';
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
}

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  courses: string[];
  duration: string;
  status: 'draft' | 'published' | 'archived';
  enrollmentCount: number;
  price: number;
  startDate: string;
  endDate: string;
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
  courseId: string;
  courseName: string;
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
}

export interface Assessment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  type: 'quiz' | 'assignment' | 'exam' | 'survey';
  questions: number;
  duration: number;
  passingScore: number;
  attempts: number;
  status: 'draft' | 'published' | 'archived';
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
