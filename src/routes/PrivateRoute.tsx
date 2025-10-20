import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import { RootState } from '../app/store';

const PrivateRoute: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;