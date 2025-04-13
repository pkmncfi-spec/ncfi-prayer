import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { app } from "~/lib/firebase";

const db = getFirestore(app); // Ensure you have the Firestore instance

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

    create: publicProcedure
      .input(z.object({ imageUrl: z.string().url() })) // Ensure this matches the input
      .mutation(async ({ input }) => {
        await addDoc(collection(db, "posts"), {
          imageUrl: input.imageUrl,
          createdAt: new Date(),
        });
        return { success: true };
      }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" }, // ✅ Pastikan createdAt ada dalam model
    });

    return post ?? null;
  }),

});
