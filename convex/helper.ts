import { QueryCtx} from "./_generated/server";




export const requireUser = async (ctx:QueryCtx) => {
    const user = await ctx.auth.getUserIdentity()
    console.log(user?.subject)
        if(!user){
            throw new Error("Unauthorized")
        }
    return user
}

// user_2lr60JWg83tEJ70Cc2ycwWQEbeh
