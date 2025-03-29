"use client";
import React from "react";
import Image from "next/image";
import { logIn } from "@/lib/actions/auth";

export default function LogInGoogle() {
  return (
    <div
      onClick={() => logIn("google")}
      className="w-full gap-4 hover:cursor-pointer mt-6 h-6 rounded-md p-4 flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-center gap-4 bg-slate-200 text-slate-800 p-2 rounded-md">
        <Image
          src={"/googleLogo.jpg"}
          width={30}
          height={30}
          alt="google"
          className="object-scale-down mix-blend-multiply"
        />

        <span className="font-medium">Sign in with Google</span>
      </div>
    </div>
  );
}
