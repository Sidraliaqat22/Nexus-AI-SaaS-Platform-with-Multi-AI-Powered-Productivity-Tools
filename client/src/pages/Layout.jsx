import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
    const navigate = useNavigate()
    const [sidebar, setSidebar] = useState(false)
    const {user} =useUser()

    return user ? (
        <div className='flex flex-col h-screen w-full overflow-hidden'>
            
            {/* Navbar - Fixed height h-16 and flex for vertical centering */}
            <nav className='flex w-full h-16 items-center px-4 border-b border-gray-200 bg-white z-20'>
                <div className='flex items-center h-full gap-4'>
                    {/* Mobile Menu Toggle */}
                    <div className='sm:hidden cursor-pointer' onClick={() => setSidebar(!sidebar)}>
                        {sidebar ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                    </div>
                    
                    {/* Logo - h-full aur py-2 se middle mein rahega aur bada bhi dikhege */}
                    <div className='h-full flex items-center'>
                        <img 
                            src={assets.logo} 
                            alt='logo' 
                            className='h-12 w-auto object-contain cursor-pointer' 
                            onClick={() => navigate('/')} 
                        />
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className='flex flex-1 w-full overflow-hidden'>
                
                {/* Sidebar - Iski apni width w-80 hai */}
                <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

                {/* Dashboard Area - p-0 aur m-0 se sidebar ke sath chipka rahega */}
                <div className='flex-1 bg-[#F4F7FB] overflow-y-auto'>
                    <div className='p-0 m-0'> 
                        <Outlet />
                    </div>
                </div>

            </div>
        </div>
    ) :(
      <div className='flex items-center justify-center h-screen'>
        <SignIn/>
      </div>
    )
}

export default Layout