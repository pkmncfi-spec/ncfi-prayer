import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import admin from 'firebase-admin';

// Inisialisasi Firebase Admin jika belum diinisialisasi
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    await admin.auth().verifyIdToken(token.value);
    return NextResponse.next();
  } catch (error) {
    console.error('Invalid token:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'], // Middleware hanya berlaku untuk path tertentu
};
