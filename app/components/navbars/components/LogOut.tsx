"use client"
import { Button } from '@/components/ui/button'
import { logOut } from '@/lib/actions/auth'
import React from 'react'

export default function LogOut() {
  return <Button onClick={()=> logOut()}>LogOut</Button>
}
