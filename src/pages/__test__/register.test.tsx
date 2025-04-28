import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useAuth } from '~/context/authContext';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import RegisterPage from '../register';
import { doc, setDoc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';

// Mock all dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('~/context/authContext');

jest.mock('react-firebase-hooks/auth', () => ({
  useCreateUserWithEmailAndPassword: jest.fn(),
}));
jest.mock('~/components/ui/button');
jest.mock('~/components/ui/checkbox');

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  sendEmailVerification: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseCreateUser = useCreateUserWithEmailAndPassword as jest.MockedFunction<
  typeof useCreateUserWithEmailAndPassword
>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockSendEmailVerification = sendEmailVerification as jest.MockedFunction<typeof sendEmailVerification>;

describe('Register Page', () => {
  it('renders register form', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
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

    render(<RegisterPage />);
    expect(mockUseRouter().push).toHaveBeenCalledWith('/');
  });
});