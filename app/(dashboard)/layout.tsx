import React from 'react'
import TopNavbar from '../components/navbars/TopNavbar'

export default function layout({children}:{children: React.ReactNode}) {
  return (
    <div className='flex flex-col'>
      <TopNavbar/>
      {children}
    </div>
  )
}