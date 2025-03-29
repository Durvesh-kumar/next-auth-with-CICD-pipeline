"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3),
  conformPassword: z.string().min(6)
}).refine((data)=> data.password === data.conformPassword, {
  message: "Password and Confirm-password does not match"
});

export default function Register({setLoading}:{setLoading: (Value:boolean)=> void}) {

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      conformPassword: "",
      name: ""
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    const res = await fetch("/api/sign-up", {
      method: "POST",
      body: JSON.stringify(values)
    });

    const data = await res.json();

    if(data.success){
      setLoading(false)
      toast.success(data.message)
      window.location.replace(`/sign-up/${values.email}`);
    }
    if(data.error){
      setLoading(false)
      toast.error(data.message)
    }
  }

  const handlePressKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  return (
    <div className="w-full mt-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username :</FormLabel>
                <FormControl>
                  <Input onKeyDown={handlePressKey} placeholder="Please enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email :</FormLabel>
                <FormControl>
                  <Input onKeyDown={handlePressKey} placeholder="Please enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password :</FormLabel>
                  <FormControl>
                    <Input type="password" onKeyDown={handlePressKey} placeholder="Please enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="conformPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conform-password :</FormLabel>
                  <FormControl>
                    <Input type="password" onKeyDown={handlePressKey} placeholder="Please enter conform-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </Form>
    </div>
  );
}