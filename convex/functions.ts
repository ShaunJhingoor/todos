import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helper";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { action } from "./_generated/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Buffer } from "buffer";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const uploadFileToS3 = action({
  args: {
    file: v.string(),
    fileName: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const { file, fileName, contentType } = args;

    const buffer = Buffer.from(file, "base64");
    const key = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await s3Client.send(command);
      const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return s3Url;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new Error("Failed to upload file to S3");
    }
  },
});

export const listUserLists = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const allLists = await ctx.db.query("lists").collect();

    const userLists = allLists.filter((list) =>
      list.participants.some((p) => p.userId == user?.subject)
    );

    return userLists;
  },
});

export const getListById = query({
  args: {
    id: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id);

    if (!list) {
      throw new Error("List not found");
    }

    const user = await requireUser(ctx);
    const isParticipant = list.participants.some(
      (participant) => participant.userId === user?.subject
    );

    if (!isParticipant) {
      throw new Error("Unauthorized: User not part of the list");
    }

    return list;
  },
});

export const createList = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const email = user.email || "no-reply@example.com";
    await ctx.db.insert("lists", {
      name: args.name,
      ownerId: user?.subject,
      participants: [{ userId: user?.subject, email, role: "editor" }],
    });
  },
});

export const editList = mutation({
  args: {
    listId: v.id("lists"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);

    if (list?.ownerId != user?.subject) {
      throw new Error("Unauthorized to edit this list");
    }

    // Update the list name
    await ctx.db.patch(args.listId, {
      name: args.newName,
    });
  },
});

export const deleteList = mutation({
  args: {
    listId: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);

    if (list?.ownerId != user?.subject) {
      throw new Error("Unauthorized to delete this list");
    }

    // Delete the list
    await ctx.db.delete(args.listId);
  },
});

export const getUserIdByEmail = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    try {
      const response = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      const users = response.data;

      if (Array.isArray(users) && users.length > 0) {
        return users[0].id;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user ID by email:", error);
      throw new Error("Failed to fetch user ID by email");
    }
  },
});

export const addParticipant = mutation({
  args: {
    listId: v.id("lists"),
    userId: v.string(),
    email: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, { listId, userId, email, role }) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(listId);

    if (list?.ownerId != user?.subject) {
      throw new Error("Unauthorized to add participants to this list");
    }

    const existingParticipant = list?.participants?.find(
      (participant) => participant.userId == userId
    );

    if (existingParticipant) {
      throw new Error("Participant already added to this list");
    }

    await ctx.db.patch(listId, {
      participants: [...(list?.participants || []), { userId, email, role }],
    });

    return { success: true };
  },
});

export const changeParticipantRole = mutation({
  args: {
    listId: v.id("lists"),
    userId: v.string(),
    newRole: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);

    if (list?.ownerId != user?.subject) {
      throw new Error("Unauthorized to change participant roles in this list");
    }

    // Update participant's role
    await ctx.db.patch(args.listId, {
      participants: list?.participants.map((p) =>
        p.userId === args.userId ? { ...p, role: args.newRole } : p
      ),
    });
  },
});

export const removeParticipant = mutation({
  args: {
    listId: v.id("lists"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);

    if (list?.ownerId != user?.subject) {
      throw new Error("Unauthorized to remove participants from this list");
    }

    // Remove participant from the list
    await ctx.db.patch(args.listId, {
      participants: list?.participants.filter((p) => p.userId !== args.userId),
    });
  },
});

export const leaveList = mutation({
  args: {
    listId: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);

    if (!list) {
      throw new Error("List not found");
    }

    const participantIndex = list.participants.findIndex(
      (p) => p.userId === user?.subject
    );

    if (participantIndex === -1) {
      throw new Error("User is not a participant of this list");
    }

    if (list.ownerId === user?.subject) {
      throw new Error(
        "Owner cannot leave the list. Please delete the list if needed."
      );
    }

    await ctx.db.patch(args.listId, {
      participants: list.participants.filter((p) => p.userId !== user?.subject),
    });
  },
});

export const listTodos = query({
  args: {
    listId: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);
    if (!list?.participants.some((p) => p.userId == user?.subject)) {
      throw new Error("Unauthorized to view todos for this list");
    }
    return await ctx.db
      .query("todos")
      .withIndex("by_list_id", (q) => q.eq("listId", args.listId))
      .collect();
  },
});

export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    listId: v.id("lists"),
    dueDate: v.string(),
    expectedTime: v.string(),
    assigneeEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);

    const isEditor = list?.participants.some(
      (p) => p.userId === user?.subject && p.role === "editor"
    );
    if (!isEditor) {
      throw new Error("Unauthorized to create todos for this list");
    }

    await ctx.db.insert("todos", {
      title: args.title,
      description: args.description,
      completed: false,
      listId: args.listId,
      dueDate: args.dueDate,
      expectedTime: args.expectedTime,
      assigneeEmail: "unassigned",
    });
  },
});

export const updateTodoCompletionStatus = mutation({
  args: {
    id: v.id("todos"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const todo = await ctx.db.get(args.id);

    if (todo?.listId) {
      const list = await ctx.db.get(todo.listId);
      const isEditor = list?.participants.some(
        (p) => p.userId === user?.subject && p.role === "editor"
      );
      if (!isEditor) {
        throw new Error("Unauthorized to update this todo");
      }
    }

    await ctx.db.patch(args.id, {
      completed: args.completed,
    });
  },
});

export const updateTodoDetails = mutation({
  args: {
    id: v.id("todos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    expectedTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const todo = await ctx.db.get(args.id);

    if (todo?.listId) {
      const list = await ctx.db.get(todo.listId);
      const isEditor = list?.participants.some(
        (p) => p.userId === user?.subject && p.role === "editor"
      );
      if (!isEditor) {
        throw new Error("Unauthorized to update this todo");
      }
    }

    // Update all fields provided in the arguments
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      expectedTime: args.expectedTime,
    });
  },
});

export const assignTodo = mutation({
  args: {
    id: v.id("todos"),
    assignedTo: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const todo = await ctx.db.get(args.id);

    if (!todo) {
      throw new Error("Todo not found");
    }

    const list = await ctx.db.get(todo.listId);
    const isEditor = list?.participants.some(
      (p) => p.userId === user?.subject && p.role === "editor"
    );

    if (!isEditor) {
      throw new Error("Unauthorized to assign this todo");
    }

    // Update the assignedTo field
    await ctx.db.patch(args.id, { assigneeEmail: args.assignedTo });
  },
});

export const deleteTodo = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const todo = await ctx.db.get(args.id);
    if (todo?.listId) {
      const list = await ctx.db.get(todo.listId);

      // Check if the user is an editor in the list
      const isEditor = list?.participants.some(
        (p) => p.userId === user?.subject && p.role === "editor"
      );
      if (!isEditor) {
        throw new Error("Unauthorized to delete this todo");
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const listMessages = query({
  args: {
    listId: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);

    // Ensure the user is an editor
    const isEditor = list?.participants.some(
      (p) => p.userId === user?.subject && p.role === "editor"
    );
    if (!isEditor) {
      throw new Error("Unauthorized to view messages for this list");
    }

    // Fetch all messages for this list
    return await ctx.db
      .query("messages")
      .withIndex("by_list_id", (q) => q.eq("listId", args.listId))
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    listId: v.id("lists"),
    message: v.string(),
    attachmentUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const list = await ctx.db.get(args.listId);

    // Ensure the user is an editor
    const isEditor = list?.participants.some(
      (p) => p.userId === user?.subject && p.role === "editor"
    );
    if (!isEditor) {
      throw new Error("Unauthorized to send messages to this list");
    }

    const newMessage = await ctx.db.insert("messages", {
      listId: args.listId,
      senderId: user?.subject,
      message: args.message,
      timestamp: Date.now(),
      attachmentUrl: args.attachmentUrl,
    });
    return newMessage;
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (message?.senderId !== user.subject) {
      throw new Error("Unauthorized to edit this message.");
    }

    return await ctx.db.patch(args.messageId, {
      message: args.message,
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (message?.senderId !== user.subject) {
      throw new Error("Unauthorized to delete this message.");
    }

    return await ctx.db.delete(args.messageId);
  },
});
