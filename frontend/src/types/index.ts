export interface User {
  id: number;
  email: string;
  role: 'hr_admin' | 'employee';
  is_active: boolean;
}

export interface Employee {
  id: number;
  user_id?: number;
  employee_code: string;
  full_name: string;
  department: string;
  job_title: string;
  joining_date: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  base_salary: number;
  status: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  department?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'late' | 'absent' | 'half_day' | 'leave';
  hours_worked: number;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_email?: string;
  department?: string;
  leave_type: 'paid' | 'sick' | 'unpaid';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_comment?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  email_sent?: boolean;
  email_error?: string;
}

export interface Payroll {
  id: number;
  employee_id: number;
  employee_name?: string;
  pay_period: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
}

export interface WorkforceInsight {
  id: number;
  signal: string;
  severity: 'low' | 'medium' | 'high';
  department: string;
  evidence: string;
  explanation: string;
  recommended_action: string;
  affected_count: number;
  is_reviewed: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  is_read: boolean;
  created_at: string;
}

export interface HRDashboardSummary {
  total_employees: number;
  present_today: number;
  on_leave: number;
  pending_approvals: number;
  attendance_risk: number;
  payroll_alerts: number;
}

export interface HRDashboardData {
  summary: HRDashboardSummary;
  attendance_breakdown: {
    present: number;
    late: number;
    absent: number;
    leave: number;
  };
  weekly_trend: {
    day: string;
    present: number;
    late: number;
    absent: number;
  }[];
  insights: WorkforceInsight[];
  recent_leaves: LeaveRequest[];
  notifications: Notification[];
}

export interface EmployeeDashboardData {
  employee: Employee;
  today_attendance?: Attendance;
  leave_balances: {
    paid: number;
    sick: number;
    unpaid: number;
  };
  pending_requests: LeaveRequest[];
  recent_attendance: Attendance[];
  latest_payroll?: Payroll;
  notifications: Notification[];
}

export interface AuthState {
  token: string | null;
  role: 'hr_admin' | 'employee' | null;
  user_id: number | null;
  email: string | null;
  full_name: string | null;
  employee_code?: string | null;
  department?: string | null;
  job_title?: string | null;
  employee_id?: number | null;
}
