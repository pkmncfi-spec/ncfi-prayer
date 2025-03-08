import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
  .input(z.object({ title: z.string().min(1), userId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.post.create({
      data: {
        title: input.title, // ✅ Menggunakan 'title' sesuai model Prisma
        userId: input.userId,
        createdAt: new Date(), // Pastikan ada createdAt jika dipakai di getLatest
      },
    });
  }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" }, // ✅ Pastikan createdAt ada dalam model
    });

    return post ?? null;
  }),

});
