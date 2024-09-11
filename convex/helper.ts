import { QueryCtx} from "./_generated/server";
import {  clerkClient, createClerkClient } from "@clerk/clerk-sdk-node";



export const requireUser = async (ctx:QueryCtx) => {
    const user = await ctx.auth.getUserIdentity()
        if(!user){
            throw new Error("Unauthorized")
        }
    return user
}


  export const getUserByEmail = async (ctx: QueryCtx, email: string) => {

    const users = await ctx.auth
    return users
  
};