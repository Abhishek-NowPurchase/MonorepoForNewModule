import GradeCreate from './pages/create';

export const routes = [
  { path: '/grades/add', component: GradeCreate },
  { path: '/grades/:id/edit', component: GradeCreate },
];

export const defaultRoute = '/grades/list';
