import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => (
  <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
    <p className="font-display text-7xl font-extrabold text-gradient">404</p>
    <h1 className="mt-4 text-2xl font-bold text-ink-900">Page not found</h1>
    <p className="mt-2 max-w-sm text-ink-500">
      The page you’re looking for doesn’t exist or has moved.
    </p>
    <Button as={Link} to="/" className="mt-6">
      Back home
    </Button>
  </div>
);

export default NotFound;
