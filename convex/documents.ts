import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const getIdentity = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw new Error("Not authenticated");
  const userId = identity.subject;

  return { userId };
};

const checkForExistingDocument = async (ctx: any, id: any) => {
  const existingDocument = await ctx.db.get(id);
  const { userId } = await getIdentity(ctx);

  // Error handling:
  if (!existingDocument) {
    throw new Error("Not found");
  }

  if (existingDocument.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return { existingDocument };
};

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const { userId } = await getIdentity(ctx);

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
    const { userId } = await getIdentity(ctx);

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
    const { userId } = await getIdentity(ctx);

    await checkForExistingDocument(ctx, args.id);

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

export const getTrash = query({
  handler: async ctx => {
    const { userId } = await getIdentity(ctx);

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return documents;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const { userId } = await getIdentity(ctx);

    const { existingDocument } = await checkForExistingDocument(ctx, args.id);

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", q =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);

      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const document = await ctx.db.patch(args.id, options);

    recursiveRestore(args.id);

    return document;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await getIdentity(ctx);
    await checkForExistingDocument(ctx, args.id);

    const document = await ctx.db.delete(args.id);
    return document;
  },
});

export const getSearch = query({
  handler: async ctx => {
    const { userId } = await getIdentity(ctx);

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getDocumentById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);

    // error handling
    if (!document) throw new Error("Not found");

    if (document.isPublished && !document.isArchived) return document;

    const { userId } = await getIdentity(ctx);
    if (document.userId !== userId) throw new Error("Unauthorized");

    return document;
  },
});

export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await getIdentity(ctx);
    await checkForExistingDocument(ctx, args.id);

    const { id, ...rest } = args;

    const document = await ctx.db.patch(args.id, {
      ...rest,
    });

    return document;
  },
});

export const removeIcon = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await getIdentity(ctx);
    await checkForExistingDocument(ctx, args.id);

    const document = await ctx.db.patch(args.id, {
      icon: undefined,
    });

    return document;
  },
});

export const removeCoverImage = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await getIdentity(ctx);
    await checkForExistingDocument(ctx, args.id);

    const document = await ctx.db.patch(args.id, {
      coverImage: undefined,
    });

    return document;
  },
});
