import { mutation, query } from "./_generated/server"
import {v} from "convex/values"

export const listTodos = query({
    handler: async (ctx) => {
        return await ctx.db.query("todos").collect()
    }
});

export const createTodo = mutation({
    args: {
        title: v.string(),
        description: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("todos",{
            title: args.title,
            description: args.description,
            completed: false
        })
    },
})

export const updateTodo = mutation({
    args: {
        id: v.id("todos"),
        completed: v.boolean(),
    },
    handler: async(ctx, args) => {
        await ctx.db.patch(args.id,{
            completed: args.completed
        })
    }
})

export const deleteTodo = mutation({
    args: {
        id: v.id("todos"),
    },
    handler: async(ctx, args) => {
        await ctx.db.delete(args.id)
    }
})