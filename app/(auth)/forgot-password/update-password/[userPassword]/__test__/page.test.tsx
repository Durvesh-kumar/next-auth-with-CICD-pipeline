"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import Loader from "@/app/components/Loader";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

const FormSchema = z
  .object({
    password: z.string().min(6).max(15),
    confirmPassword: z.string(),
    email: z.string().email(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Password and Confirm password does not meatch",
  });

export default function Page() {
  const params = useParams<{ userPassword: string }>();

  const email = params.userPassword;

  const userEmail = decodeURIComponent(email);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      email: userEmail,
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    console.log(values);
    
    setLoading(true);
    const res = await fetch("/api/forgot-password/update-password", {
      method: "POST",
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (data.success) {
      toast.success(data.message);
      setLoading(false);
      router.push("/sign-in");
    }

    if (data.error) {
      setLoading(false);
      toast.error(data.message);
    }
  }

  const handlePressKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="flex items-center flex-col justify-center min-h-screen gap-4">
      <div className="p-5 border-separate border-primary dark:border-blue-500 shadow-sm border-2 rounded-lg">
        <h1 className="text-2xl font-bold text-center my-5">Update Password</h1>
        <section className="grid gap-3 w-full mt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password:</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="w-[400px]"
                        onKeyDown={handlePressKey}
                        placeholder="Please enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm-password:</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        onKeyDown={handlePressKey}
                        placeholder="Please enter confirm password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </div>
  );
}