import { mutation, query } from "./_generated/server"
import {v} from "convex/values"
import { requireUser } from "./helper";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { action } from "./_generated/server";

// Initialize Clerk client with your secret key
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const listUserLists = query({
    handler: async (ctx) => {
      const user = await requireUser(ctx);

      console.log(user)
      const allLists = await ctx.db.query("lists").collect();
      
      // Filter lists to find those where the user is a participant
      const userLists = allLists.filter(list =>
        list.participants.some(p => p.userId == user?.subject)
      );
  
      return userLists;
    },
  });

  export const getListById = query({
    args: {
      id: v.id("lists"),
    },
    handler: async (ctx, args) => {
      const user = await requireUser(ctx);
  
  
      const list = await ctx.db.get(args.id);
  
      if (list && list.participants.some(p => p.userId === user?.subject)) {
        return list;
      } else {
        throw new Error("Unauthorized or list not found");
      }
    },
  });

export const createList = mutation({
    args: {
      name: v.string(),
    },
    handler: async (ctx, args) => {
      const user = await requireUser(ctx);
      const email = user.email || "no-reply@example.com"
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
        console.log("response:", response)
        const users = response.data;
        console.log("users:", users)
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
  
  // Mutation to add participant
  export const addParticipant = mutation({
    args: {
      listId: v.id("lists"),
      userId: v.string(),
      email: v.string(),
      role: v.union(v.literal("editor"), v.literal("viewer")),
    },
    handler: async (ctx, { listId, userId,email, role }) => {
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
  
      // Check if the user is the owner of the list
      if (list?.ownerId != user?.subject) {
        throw new Error("Unauthorized to change participant roles in this list");
      }
  
      // Update participant's role
      await ctx.db.patch(args.listId, {
        participants: list?.participants.map(p =>
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
        participants: list?.participants.filter(p => p.userId !== args.userId),
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
  
      // Check if the list exists
      if (!list) {
        throw new Error("List not found");
      }
  
      // Find the participant
      const participantIndex = list.participants.findIndex(
        (p) => p.userId === user?.subject
      );
  
      if (participantIndex === -1) {
        throw new Error("User is not a participant of this list");
      }
  
      // If the user is the owner of the list, they cannot leave without deleting the list
      if (list.ownerId === user?.subject) {
        throw new Error("Owner cannot leave the list. Please delete the list if needed.");
      }
  
      // Remove the user from the participants list
      await ctx.db.patch(args.listId, {
        participants: list.participants.filter(
          (p) => p.userId !== user?.subject
        ),
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
      if (!list?.participants.some(p => p.userId == user?.subject)) {
        throw new Error("Unauthorized to view todos for this list");
      }
      return await ctx.db.query("todos")
        .withIndex("by_list_id", q => q.eq("listId", args.listId))
        .collect();
    },
  });

  export const createTodo = mutation({
    args: {
      title: v.string(),
      description: v.string(),
      listId: v.id("lists"),
      dueDate: v.string(),
      expectedTime: v.string(), // Correctly include expectedTime here
    },
    handler: async (ctx, args) => {
      const user = await requireUser(ctx);
      const list = await ctx.db.get(args.listId);
  
      const isEditor = list?.participants.some(p => p.userId === user?.subject && p.role === "editor");
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
        const isEditor = list?.participants.some(p => p.userId === user?.subject && p.role === "editor");
        if (!isEditor) {
          throw new Error("Unauthorized to update this todo");
        }
      }
  
      // Update only the completed status
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
        const isEditor = list?.participants.some(p => p.userId === user?.subject && p.role === "editor");
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
        const isEditor = list?.participants.some(p => p.userId === user.tokenIdentifier && p.role === "editor");
        if (!isEditor) {
          throw new Error("Unauthorized to delete this todo");
        }
      }
  
      await ctx.db.delete(args.id);
    },
  });