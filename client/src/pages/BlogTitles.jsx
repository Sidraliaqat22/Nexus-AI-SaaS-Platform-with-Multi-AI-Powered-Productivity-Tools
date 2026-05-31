import { useAuth } from '@clerk/clerk-react';
import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    "General", "Technology", "Business", "Health", "Lifestyle", "Education", "Travel", "Food"
  ]

  const [selectedCategory, setSelectedCategory] = useState("General")
  const [input, setInput] = useState('')

  const[ loading, setLoading]= useState(false)
  const [content, setContent]= useState('')

  const {getToken} = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try{
      setLoading(true)
      const prompt = `Generate blog titles for the keyword "${input}" in the category "${selectedCategory}". 

                      Start with one line: "Here are a few blog title options for the keyword "${input}" in the category "${selectedCategory}", ranging from beginner-friendly to more advanced:"

                      Then organize into exactly 3 sections:
                      **Beginner-Friendly:**
                      **Intermediate:**
                      **Advanced:**

                      Give bullet point titles in each section.`
      const {data}=  await axios.post('/api/ai/generate-blog-title', {prompt}, {
        headers: { Authorization: `Bearer ${await getToken()}`
      }
      })
      if(data.success){
        setContent(data.content)
      }else{
        toast.error(data.message)
      }
    } catch(error){
      toast.error(error.message)
    }
    setLoading(false)


    
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* Left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3' >
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>
        
        <p className='mt-6 text-sm font-medium'>Keyword</p>
        <input 
          onChange={(e) => setInput(e.target.value)} 
          value={input} 
          type='text' 
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' 
          placeholder='The future of artificial intelligence is...' 
          required 
        />

        <p className='mt-4 text-sm font-medium'>Category</p>

        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {/* Yahan 'index' add kiya hai */}
          {blogCategories.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectedCategory(item)} // Yahan name sahi kiya hai
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedCategory === item
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
        <br />
        <button disabled={loading} type="submit" className='w-full flex justify-center
         items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] 
         text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>:  <Hash className='w-5' />}
          
          Generate title
        </button>
      </form>

      {/* Right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Hash className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated titles</h1>
        </div>
        {
          !content? (
            <div className='flex-1 flex justify-center items-center'>
              <div className='text-sm flex flex-col items-center gap-5 text-gray-400' >
                <Hash className='w-9 h-9 ' />
                <p>Enter a topic and click "Generate title" to get started</p>
              </div>

            </div>

          ):(
            <div className= 'mt-3 h-full overflow-y-auto text-sm text-slate-600'>
              <div className='.reset-tw'  >
                <Markdown
                   components={{
                     ol: ({children}) => <ol className='list-decimal pl-4 space-y-3'>{children}</ol>,
                     ul: ({children}) => <ul className='list-disc pl-4 space-y-1'>{children}</ul>,
                     li: ({children}) => <li className='leading-relaxed text-sm text-slate-600'>{children}</li>,
                     strong: ({children}) => <strong className='font-bold text-slate-800 block mt-4 mb-1'>{children}</strong>,
                     p: ({children}) => <p className='text-sm text-slate-700 leading-relaxed'>{children}</p>,
                    }}
                >
                  {content}
               </Markdown>
                
              </div>
              
            </div>
          )

        }
       
      </div>
    </div>
  )
}

export default BlogTitles