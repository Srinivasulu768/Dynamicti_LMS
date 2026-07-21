import dashboardData from '@/mock/dashboard.json';

/**
 * Dashboard service — provides dashboard statistics.
 * Currently reads static mock data.
 * When backend is available, replace with API calls.
 */
export const dashboardService = {
  getSuperAdminData() {
    return dashboardData.superAdmin;
  },

  getTrainingAdminData() {
    return dashboardData.trainingAdmin;
  },

  getContentManagerData() {
    return dashboardData.contentManager;
  },

  getInstructorData() {
    return dashboardData.instructor;
  },

  getOrgAdminData() {
    return dashboardData.orgAdmin;
  },

  getLearnerData() {
    return dashboardData.learner;
  },
};
