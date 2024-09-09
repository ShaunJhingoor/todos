"use client";
import { NewToDoForm } from "./components/new-todo-form";
import { ListToDo } from "./components/to-do-list";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import {  SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  
  return (
    <div className="max-w-screen-md mx-auto p-4 space-y-4">
      <Authenticated>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">To Do List</h1>
          <UserButton/>
        </div>
        <ListToDo/>
        <NewToDoForm/>
      </Authenticated>
      <Unauthenticated>
        <p className="text-gray-600">Please Sign In</p>
        <SignInButton>
         <button className="p-1 bg-blue-500 text-white rounded">Sign In</button>
        </SignInButton>
      </Unauthenticated>
      <AuthLoading>
        <p>...Loading</p>
      </AuthLoading>
    </div>
  );
}

