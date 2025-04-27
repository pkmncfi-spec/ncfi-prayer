import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useAuth } from '~/context/authContext';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import AuthPage from '../login';
import { doc, getDoc } from 'firebase/firestore';

// Mock all dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('~/context/authContext');

jest.mock('react-firebase-hooks/auth', () => ({
  useSignInWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock UI components
jest.mock('~/components/ui/button');
jest.mock('~/components/ui/checkbox');

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  setPersistence: jest.fn(),
  browserLocalPersistence: {},
  browserSessionPersistence: {},
}));

jest.mock('~/lib/firebase', () => ({
  auth: {},
  app: {},
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseSignInWithEmailAndPassword = useSignInWithEmailAndPassword as jest.MockedFunction<
  typeof useSignInWithEmailAndPassword
>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

describe('Login Page', () => {
  const mockPush = jest.fn();
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock router
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    // Mock auth context
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
    });

    // Mock sign in hook
    mockUseSignInWithEmailAndPassword.mockReturnValue([
      mockSignIn,
      null,
      false,
      null,
    ]);
  });

  it('renders the login form correctly', () => {
    render(<AuthPage />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Show Password')).toBeInTheDocument();
    expect(screen.getByText('Remember Me')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText(/Forgot Password/)).toBeInTheDocument();
    expect(screen.getByText(/Or Continue With/)).toBeInTheDocument();
    expect(screen.getByText(/Dont Have Account/)).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<AuthPage />);
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const showPasswordCheckbox = screen.getByLabelText('Show Password');

    // Initially should be password type
    expect(passwordInput.type).toBe('password');

    // Toggle to show password
    fireEvent.click(showPasswordCheckbox);
    expect(passwordInput.type).toBe('text');

    // Toggle back to hide password
    fireEvent.click(showPasswordCheckbox);
    expect(passwordInput.type).toBe('password');
  });

  it('toggles remember me', () => {
    render(<AuthPage />);
    const rememberMeCheckbox = screen.getByLabelText('Remember Me');

    // Initially should be unchecked
    expect(rememberMeCheckbox).not.toBeChecked();

    // Toggle to checked
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();

    // Toggle back to unchecked
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('validates email format', async () => {
    render(<AuthPage />);
  
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByText('Submit'));
  
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  it('shows error when email is empty', async () => {
    render(<AuthPage />);
  
    fireEvent.click(screen.getByText('Submit'));
  
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });

  describe('login submission', () => {
    it('handles successful login', async () => {
      const mockUser = {
        uid: 'test-uid',
        emailVerified: true,
      };

      mockSignIn.mockResolvedValue({
        user: mockUser,
      });

      mockGetDoc.mockResolvedValue({
        data: () => ({ role: 'user' }),
      } as any);

      render(<AuthPage />);

      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Password'), { 
        target: { value: 'password123' } 
      });
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockPush).toHaveBeenCalledWith('/user/home');
      });
    });

    it('redirects to verification if email not verified', async () => {
      const mockUser = {
        uid: 'test-uid',
        emailVerified: false,
      };

      mockSignIn.mockResolvedValue({
        user: mockUser,
      });

      render(<AuthPage />);

      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Password'), { 
        target: { value: 'password123' } 
      });
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/verify/test-uid');
      });
    });

    it('handles Firebase authentication errors', async () => {
        const error = {
          code: 'auth/wrong-password',
          message: 'Wrong password',
        };
      
        mockSignIn.mockRejectedValue(error);
      
        render(<AuthPage />);
      
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByText('Submit'));
      
        await waitFor(() => {
          expect(screen.getByText(/Wrong password/i)).toBeInTheDocument();
        });
      });
      
      it('shows loading state during submission', async () => {
        mockSignIn.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      
        render(<AuthPage />);
      
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByText('Submit'));
      
        await waitFor(() => {
          expect(screen.getByRole('progressbar') || screen.getByTestId('loading-spinner')).toBeInTheDocument();
        });
      });
  });

  it('redirects authenticated users to their home page', async () => {
    const mockUser = {
      uid: 'test-uid',
      emailVerified: true,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
    });

    mockGetDoc.mockResolvedValue({
      data: () => ({ role: 'admin' }),
    } as any);

    render(<AuthPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/home');
    });
  });

  it('redirects unverified users to verification page', async () => {
    const mockUser = {
      uid: 'test-uid',
      emailVerified: false,
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
    });

    render(<AuthPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/verify/test-uid');
    });
  });
});