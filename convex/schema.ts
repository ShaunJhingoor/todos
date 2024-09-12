import {defineSchema, defineTable} from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    todos: defineTable({
        title: v.string(),
        description: v.string(),
        completed: v.boolean(),
        listId: v.id("lists"),
        dueDate: v.string(),
        expectedTime: v.string(),
    })
    .index("by_list_id",["listId"]),

    lists: defineTable({
        name: v.string(),
        ownerId: v.string(), 
        participants: v.array(
          v.object({
            userId: v.string(),
            email: v.string(),
            role: v.union(v.literal("editor"), v.literal("viewer")),
          })
        ), 
      })
      .index("by_owner_id", ["ownerId"]),

})

