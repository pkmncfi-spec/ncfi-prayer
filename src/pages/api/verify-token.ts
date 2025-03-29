import admin from "~/lib/firebaseAdmin";
import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";

// Define the expected input schema
const verifyTokenSchema = z.object({
  token: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Debugging: Log the incoming request body
    console.log("Request body:", req.body);

    // Validate the request body
    const { token } = verifyTokenSchema.parse(req.body);

    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Fetch user data from Firestore
    const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data() as { role: string, isVerified: boolean };

    // Return the user's UID and role
    return res.status(200).json({ uid: decodedToken.uid, role: userData.role, isVerified: userData.isVerified });
  } catch (error) {
    console.error("Token verification failed:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request body", issues: error.errors });
    }

    return res.status(401).json({ error: "Invalid or expired token" });
  }
}