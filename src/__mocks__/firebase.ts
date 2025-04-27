// src/__mocks__/firebase.ts
const mockAuth = {
  currentUser: null,
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  sendEmailVerification: jest.fn(),
  signOut: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
};

export const initializeApp = jest.fn(() => ({}));
export const getAuth = jest.fn(() => mockAuth);
export const getFirestore = jest.fn(() => mockFirestore);
export const GoogleAuthProvider = jest.fn();