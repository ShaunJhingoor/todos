import { QueryCtx} from "./_generated/server";
import {  clerkClient } from "@clerk/clerk-sdk-node";



export const requireUser = async (ctx:QueryCtx) => {
    const user = await ctx.auth.getUserIdentity()
        if(!user){
            throw new Error("Unauthorized")
        }
    return user
}

export const getUserByEmail = async (email: string) => {
  try {
      // Fetch users from Clerk filtered by email
      const response = await clerkClient.users.getUserList({
          emailAddress: [email], // Clerk expects an array for the email filter
      });

      console.log(response)
      if (Array.isArray(response)) {
          if (response.length === 0) {
              return null; // No user found with the provided email
          }

          // Return the first user found (assuming emails are unique)
          return response[0];
      } else {
          // Log and handle unexpected response structure
          console.error("Unexpected response structure:", response);
          throw new Error("Unexpected response structure from Clerk");
      }
  } catch (error) {
      console.error("Error fetching user by email:", error);
      throw new Error("Failed to fetch user by email");
  }
};
