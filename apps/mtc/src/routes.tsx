import CertificateList from './pages/certificate/list';
import CertificateCreate from './pages/certificate/create';
import CertificateDetail from './pages/certificate/detail';
import CertificateEdit from './pages/certificate/edit';
import Tensile from './pages/tensile';
import Microstructure from './pages/microstructure';
import Hardness from './pages/hardness';
import Impact from './pages/impact';

export const routes = [
  // Certificate routes - most specific first
  { path: '/mtc/certificate/:id/edit', component: CertificateEdit, isDynamic: true },
  { path: '/mtc/certificate/create', component: CertificateCreate },
  { path: '/mtc/certificate/:id', component: CertificateDetail, isDynamic: true },
  { path: '/mtc/certificate', component: CertificateList },
  { path: '/mtc/tensile', component: Tensile },
  { path: '/mtc/microstructure', component: Microstructure },
  { path: '/mtc/hardness', component: Hardness },
  { path: '/mtc/impact', component: Impact },
  // Default route - Hardness
  { path: '/mtc', component: Hardness },
];

export const defaultRoute = '/mtc';
export const defaultComponent = Hardness;

