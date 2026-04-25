import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-pulse text-gray-400'>Loading...</div>
      </div>
    )
  }

  return user ? (
    <div className='flex flex-col h-screen w-full overflow-hidden bg-gray-50'>

      {/* Navbar */}
      <nav className='flex w-full h-16 items-center px-4 border-b border-gray-200 bg-white z-20 shadow-sm'>
        <div className='flex items-center h-full gap-4'>

          {/* Mobile Menu Toggle */}
          <div
            className='sm:hidden cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition'
            onClick={() => setSidebar(!sidebar)}
          >
            {sidebar ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
          </div>

          {/* Logo */}
          <div className='h-full px-7 flex items-center'>
            <img
              src={assets.logo}
              alt='NEXUS.AI'
              className='h-14 w-auto object-contain cursor-pointer hover:opacity-80 transition'
              onClick={() => navigate('/')}
            />
          </div>
        </div>

        <div className='flex-1' />
      </nav>

      {/* Main Content Area */}
      <div className='flex flex-1 w-full overflow-hidden'>

        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        {/* ✅ FIX: p-6 wrapper hata diya — content ab sidebar se attached hai */}
        <main className='flex-1 overflow-y-auto'>
          <Outlet />
        </main>

      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
        <div className='text-center mb-6'>
          <img
            src={assets.logo}
            alt='NEXUS.AI'
            className='h-16 w-auto mx-auto mb-4'
          />
          <h1 className='text-2xl font-bold text-gray-800'>Welcome Back</h1>
          <p className='text-gray-500'>Sign in to continue</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}

export default Layout