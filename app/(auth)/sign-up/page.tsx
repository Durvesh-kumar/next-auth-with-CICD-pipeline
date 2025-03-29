"use client"
import React, { useState } from 'react'
import Register from './components/Register'
import Loader from '@/app/components/Loader'
import UpGoogle from './components/UpGoogle'
import UpFacebook from './components/UpFacebook'

export default function page() {
  const [loading, setLoading] = useState(false)
  return loading ? <Loader/> : (
    <div className='w-full flex justify-center mt-20'>
        <div className='w-1/3 max-lg:w-1/2 max-md:w-full max-md:mx-20 max-sm:mx-10 dark:bg-transparent shadow-blue-500 p-5 shadow-md rounded-md'>
            <h1 className='text-4xl text-center font-bold mb-10'>Sign Up</h1>
            <div className='flex gap-4'>
              <UpGoogle />
              <UpFacebook />
            </div>
            <Register setLoading={setLoading}/>
        </div>
    </div>
  )
}