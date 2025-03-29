"use client";
import { logIn } from '@/lib/actions/auth';
import { Facebook } from 'lucide-react'
import React from 'react'

export default function LogInFacebook() {
  return (
    <div onClick={()=> logIn("facebook")} className='w-full gap-4 hover:cursor-pointer mt-6 h-6 rounded-md p-4 flex items-center justify-center '>
        <div className='flex w-full items-center justify-center gap-4 bg-blue-700 text-white p-2 rounded-md'>
            <Facebook size={30}/>
            <span className='font-medium'>Sign in with Facebook</span>
        </div>
    </div>
  )
}