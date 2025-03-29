import { cn } from '@/lib/utils';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function HomeLogo({fontSize="2xl", iconSize=20}:{fontSize?: string, iconSize?: number}) {
  return (
    <Link href={"/"} className={cn("text-2xl font-extrabold flex items-center gap-2", fontSize)}>
        <div className='rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-2'>
            <LayoutDashboard size={iconSize} className='stroke-white'/>
        </div>
        <div>
            <span className='bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent'>Dash</span>
            <span className='text-stone-700 dark:text-stone-300'>board</span>
        </div>
    </Link>
  )
};