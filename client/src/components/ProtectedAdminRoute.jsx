

import  { useContext } from 'react';
     import { Navigate } from 'react-router-dom';
     import { AuthContext } from '../context/AuthContext';

     const ProtectedAdminRoute = ({ children }) => {
       const { user } = useContext(AuthContext);

       if (!user || user.role !== 'admin') {
         console.log('ProtectedAdminRoute - Redirecting to /admin-login, user:', user);
         return <Navigate to="/admin-login" replace />;
       }

       return children;
     };

     export default ProtectedAdminRoute;