import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Projects from '../pages/Projects';
import About from '../pages/About';
import Courses from '../pages/Courses';
import CourseDetail from '../pages/CourseDetail';
import CustomerLogin from '../pages/CustomerLogin';
import CustomerRegister from '../pages/CustomerRegister';
import AdminLogin from '../pages/Admin/Login';
import Dashboard from '../pages/Admin/Dashboard';
import ManageProjects from '../pages/Admin/ManageProjects';
import ManageHomepage from '../pages/Admin/ManageHomepage';
import ManageArticles from '../pages/Admin/ManageArticles';
import ManageAbout from '../pages/Admin/ManageAbout';
import ManageNewsletter from '../pages/Admin/ManageNewsletter';
import ManageCourses from '../pages/Admin/ManageCourses';
import ManageTechStacks from '../pages/Admin/ManageTechStacks';
import CourseBuilder from '../pages/Admin/CourseBuilder';
import ChangePassword from '../pages/Admin/ChangePassword';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import CustomerProtectedRoute from './CustomerProtectedRoute';

const Router = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="about" element={<About />} />
        
        {/* Protected Customer Routes */}
        <Route 
          path="courses" 
          element={
            <CustomerProtectedRoute>
              <Courses />
            </CustomerProtectedRoute>
          } 
        />
        <Route 
          path="courses/:slug" 
          element={
            <CustomerProtectedRoute>
              <CourseDetail />
            </CustomerProtectedRoute>
          } 
        />
      </Route>

      {/* Customer Auth Routes */}
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/register" element={<CustomerRegister />} />

      {/* Admin Login (public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="homepage" element={<ManageHomepage />} />
        <Route path="tech-stacks" element={<ManageTechStacks />} />
        <Route path="projects" element={<ManageProjects />} />
        <Route path="articles" element={<ManageArticles />} />
        <Route path="about" element={<ManageAbout />} />
        <Route path="newsletter" element={<ManageNewsletter />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="courses/:courseId/builder" element={<CourseBuilder />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
