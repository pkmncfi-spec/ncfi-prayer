import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import admin from "~/lib/firebaseAdmin";
import { z } from "zod";
import type { DecodedIdToken } from "firebase-admin/auth";

// Define the expected structure of user data in Firestore
const userDataSchema = z.object({
  role: z.string(), // Ensure the role is always a string
  isVerified: z.boolean(), // Ensure isVerified is always a boolean
});

export const authRouter = createTRPCRouter({
  verifyToken: publicProcedure
    .input(
      z.object({
        token: z.string(), // Validate that the token is a string
      })
    )
    .query(async ({ input }) => {
      try {
        // Verify the token using Firebase Admin SDK
        const decodedToken: DecodedIdToken = await admin.auth().verifyIdToken(input.token);

        // Fetch user data from Firestore
        const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();
        if (!userDoc.exists) {
          throw new Error("User not found");
        }

        // Validate the user data using Zod
        const userData = userDataSchema.parse(userDoc.data());

        // Return the user's UID and role
        return { uid: decodedToken.uid, role: userData.role, isVerified: userData.isVerified };
      } catch (error) {
        console.error("Token verification failed:", error);

        // Provide more specific error messages for debugging
        if (error instanceof z.ZodError) {
          throw new Error("Invalid user data format");
        }
        if (error instanceof Error && error.message === "User not found") {
          throw new Error("User not found in Firestore");
        }
        throw new Error("Invalid or expired token");
      }
    }),
});

export type AuthRouter = typeof authRouter;