import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '../login';

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('~/context/authContext', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false,
    error: null,
  })),
}));

describe('Login Page', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('redirects authenticated users', () => {
    const mockUser = {
      uid: 'test-uid',
    };

    jest.mock('~/context/authContext', () => ({
      useAuth: jest.fn(() => ({
        user: mockUser, 
        loading: false,
        error: null,
      })),
    }));

    render(<LoginPage />);

    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});