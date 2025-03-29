"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Loader from "@/app/components/Loader";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export default function Page() {

  const params = useParams<{verifyOtp:string}>()
  
  const email = params.verifyOtp
  
  const userEmail = decodeURIComponent(email)

  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setLoading(true)
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        body: JSON.stringify({values, userEmail})
      });

      const data = await res.json()

      if(data.success){
        toast.success(data.message);
        setLoading(false);
        router.push("/sign-in")
      }

      if(data.error){
        setLoading(false);
        toast.error(data.message)
      }
      
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="flex items-center flex-col justify-center min-h-screen gap-4">
      <div className="p-5 border-separate rounded-lg">
        <h1 className="text-2xl font-bold text-center my-5">Veryfy OTP</h1>
        <p className="font-medium text-center">user: {userEmail}</p>
        <section className="grid gap-3 w-full mt-2">
          <Form {...form} >
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Please enter the one-time password sent to your phone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
              <Button className="bg-primary" type="submit">Submit</Button>
              </div>

            </form>
          </Form>
        </section>
      </div>
    </div>
  );
}
