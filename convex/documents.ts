import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const getIdentity = async ctx => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw new Error("Not authenticated");

  return identity;
};

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    const userId = identity.subject;

    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
    });

    return document;
  },
});

export const getDocuments = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", q =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      .filter(q => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const archive = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    // Error handling:
    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Recursive function to archive all the children of document
    const recursiveArchive = async (documentId: Id<"documents">) => {
      // Get the children
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", q =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      // Iterate
      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });

        // Call it again
        await recursiveArchive(child._id);
      }
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);

    return document;
  },
});
