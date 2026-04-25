import React from 'react';
import { Protect, useClerk, useUser } from '@clerk/clerk-react';
import { NavLink } from 'react-router-dom';
import { Eraser, FileText, Hash, House, Image, LogOut, Scissors, SquarePen, Users } from 'lucide-react';

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
  { to: '/ai/Generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/community', label: 'Community', Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  // Safety check to prevent errors while loading
  if (!isLoaded || !user) return null;

  return (
    <div className={`w-64 bg-white border-r border-gray-400 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 z-50 
      ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
      
      <div className='my-7 w-full px-6'>
        <img src={user.imageUrl} alt="User avatar" className='w-12 h-12 rounded-full mx-auto object-cover' />
        <h1 className='mt-2 text-center font-semibold'>{user.fullName}</h1>
        
        <div className='mt-6 flex flex-col gap-1 text-sm text-gray-600'>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={to === '/ai'} 
              onClick={() => setSidebar(false)} 
              className={({ isActive }) => `px-4 py-2.5 flex items-center gap-3 rounded-lg transition-colors
                ${isActive ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white" : "hover:bg-gray-100"}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer Section with Darker Top Line and Black Premium Text */}
      <div className='w-full border-t border-gray-300 p-4 px-6 flex items-center justify-between'>
        <div onClick={() => openUserProfile()} className='flex gap-2 items-center cursor-pointer hover:opacity-80 transition'>
          <img src={user.imageUrl} className='w-8 h-8 rounded-full object-cover' alt="" />
          <div>
            <h1 className='text-sm font-medium leading-none'>{user.fullName}</h1>
            <p className='text-xs text-gray-500 mt-1'>
              <Protect fallback={<span className="text-black font-semibold">Free</span>}>
                <span className=" font-semibold">Premium</span>
              </Protect>
              {" "}plan
            </p>
          </div>
        </div>
        
        <button onClick={() => signOut()} title="Sign Out">
            <LogOut className='w-5 h-5 text-gray-400 hover:text-red-500 transition cursor-pointer' />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;