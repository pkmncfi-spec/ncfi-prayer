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
  const mockPush = jest.fn();
  const mockCreateUser = jest.fn();

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

    // Mock create user hook
    mockUseCreateUser.mockReturnValue([
      mockCreateUser,
      null,
      false,
      null,
    ]);
  });

  it('renders the registration form correctly', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Show Password')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText(/Or Continue With/)).toBeInTheDocument();
    expect(screen.getByText(/Already Have an Account/)).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<RegisterPage />);
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

  describe('form validation', () => {
    it('validates name field', async () => {
      render(<RegisterPage />);
      const submitButton = screen.getByText('Submit');
      
      fireEvent.click(submitButton);
      
      expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
    });

    it('validates email format', async () => {
      render(<RegisterPage />);
      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByText('Submit');

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      expect(await screen.findByText(/Invalid email address/i)).toBeInTheDocument();
    });

    it('validates password complexity', async () => {
      render(<RegisterPage />);
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByText('Submit');

      // Test with weak password
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/Password must contain at least one uppercase letter/i)).toBeInTheDocument();
        expect(screen.getByText(/Password must contain at least one number/i)).toBeInTheDocument();
        expect(screen.getByText(/Password must contain at least one special character/i)).toBeInTheDocument();
      });
    });

    it('validates date format', async () => {
      render(<RegisterPage />);
      const dobInput = screen.getByLabelText('Date of Birth');
      const submitButton = screen.getByText('Submit');

      fireEvent.change(dobInput, { target: { value: 'invalid-date' } });
      fireEvent.click(submitButton);

      expect(await screen.findByText(/Date format must be MM-DD-YYYY/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(<RegisterPage />);
      const submitButton = screen.getByText('Submit');
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Gender is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Country is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('registration submission', () => {
    it('handles successful registration', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      mockCreateUser.mockResolvedValue({
        user: mockUser,
      });

      mockSendEmailVerification.mockResolvedValue();

      render(<RegisterPage />);

      // Fill out form
      fireEvent.change(screen.getByLabelText('Full Name'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Gender'), { 
        target: { value: 'male' } 
      });
      fireEvent.change(screen.getByLabelText('Date of Birth'), { 
        target: { value: '01-01-1990' } 
      });
      fireEvent.change(screen.getByLabelText('Country'), { 
        target: { value: 'USA' } 
      });
      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Password'), { 
        target: { value: 'ValidPass123!' } 
      });
      
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith('test@example.com', 'ValidPass123!');
        expect(mockSendEmailVerification).toHaveBeenCalled();
        expect(mockSetDoc).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/verify/test-uid');
      });
    });

    it('sets correct regional based on country', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      mockCreateUser.mockResolvedValue({
        user: mockUser,
      });

      render(<RegisterPage />);

      // Fill out form with country from Africa region
      fireEvent.change(screen.getByLabelText('Full Name'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Gender'), { 
        target: { value: 'male' } 
      });
      fireEvent.change(screen.getByLabelText('Date of Birth'), { 
        target: { value: '01-01-1990' } 
      });
      fireEvent.change(screen.getByLabelText('Country'), { 
        target: { value: 'Ghana' } 
      });
      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Password'), { 
        target: { value: 'ValidPass123!' } 
      });
      
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockSetDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            regional: 'africa'
          })
        );
      });
    });

    it('shows loading state during submission', async () => {
      mockCreateUser.mockImplementation(() => new Promise(() => {}));

      render(<RegisterPage />);

      // Fill out form
      fireEvent.change(screen.getByLabelText('Full Name'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Gender'), { 
        target: { value: 'male' } 
      });
      fireEvent.change(screen.getByLabelText('Date of Birth'), { 
        target: { value: '01-01-1990' } 
      });
      fireEvent.change(screen.getByLabelText('Country'), { 
        target: { value: 'USA' } 
      });
      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Password'), { 
        target: { value: 'ValidPass123!' } 
      });
      
      fireEvent.click(screen.getByText('Submit'));

      expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('handles registration errors', async () => {
      const error = {
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      };
      
      mockCreateUser.mockRejectedValue(error);

      render(<RegisterPage />);

      // Fill out form
      fireEvent.change(screen.getByLabelText('Full Name'), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText('Gender'), { 
        target: { value: 'male' } 
      });
      fireEvent.change(screen.getByLabelText('Date of Birth'), { 
        target: { value: '01-01-1990' } 
      });
      fireEvent.change(screen.getByLabelText('Country'), { 
        target: { value: 'USA' } 
      });
      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Password'), { 
        target: { value: 'ValidPass123!' } 
      });
      
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText(/Email already in use/i)).toBeInTheDocument();
      });
    });
  });

  it('redirects authenticated users', async () => {
    const mockUser = {
      uid: 'test-uid',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
    });

    render(<RegisterPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/member/home');
    });
  });

  it('renders disabled Google registration button', () => {
    render(<RegisterPage />);
    const googleButton = screen.getByText(/Register with Google/i);
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toBeDisabled();
  });
});