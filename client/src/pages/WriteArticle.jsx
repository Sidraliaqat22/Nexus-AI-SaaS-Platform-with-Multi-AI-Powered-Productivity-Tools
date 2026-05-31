import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength= [
    {length: 800, text: 'Short (500-800 words)'},
    {length: 1200, text: 'Medium (800-1200 words)'},
    {length: 1600, text: 'Long (1200+ words)'},
  ]

  const  [ selectedLength, setSelectedLength] = useState(articleLength[0])
  const [ input, setInput] = useState('')
  const[ loading, setLoading]= useState(false)
  const [content, setContent]= useState('')

  const {getToken} = useAuth()
  const onSubmitHandler= async(e)=> {
    e.preventDefault();
    try{
      setLoading(true)
      const prompt = `Write an article about ${input} in ${selectedLength.text}. Start directly with the title as a # heading, no "Title:" prefix.`

    const {data}=  await axios.post('/api/ai/generate-article', {prompt, length: selectedLength.length}, {
      headers: { Authorization: `Bearer ${await getToken()}`}  
    })
    if(data.success){
      setContent(data.content)
    }else{
      toast.error(data.message)
    }

    }catch(error){
      toast.error(error.message)

    }
    setLoading(false)

  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* Left col*/}
      <form  onSubmit={ onSubmitHandler} className='w-full max-w-lg p-4 bg-white  rounded-lg border border-gray-200'>
        <div  className='flex items-center gap-3' >
          <Sparkles className='w-6  text-[#4A7AFF]'/>
          <h1 className='text-xl font-semibold'> Article Configuration</h1>
        </div>
        <p className='mt-6 text-sm font-medium'> Article Topic</p>
        <input onChange={(e)=>setInput(e.target.value)}  value={input}   type='text' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border
         border-gray-300' placeholder='The future of artificial intelligence is...'required />

         <p className='mt-4 text-sm font-medium'>Article Length</p>

         <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {articleLength.map((item, index)=>(
            <span
             key={index}
             onClick={() => setSelectedLength(item)}
              // Backticks (`) ka istemal karein aur curly braces ke andar rakhein
             className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
              selectedLength.text === item.text 
               ? "bg-blue-50 text-blue-700 border-blue-200" // Active state
               : "text-gray-500 border-gray-300"           // Inactive state
               }`}
               >
              {item.text}
           </span>
            
          ))}
         </div>
         <br/>
         <button disabled={loading}  className='w-full flex justify-center items-center gap-2 bg-gradient-to-r 
          from-[#226BFF] to-[#65ADFF]  text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
            {
              loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              :<Edit className='w-5'/>
            }

          
          Generate article
         </button>

      </form>
      {/* Right col*/}
      <div className=' w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
            <div className='flex items-center gap-3'>
              <Edit className='w-5 h-5 text-[#4A7AFF]'/>
              <h1 className='text-xl font-semibold'> Generated article</h1>
            </div>
            {!content ? (
              <div className='flex-1 flex justify-center items-center'>
              <div className='text-sm flex flex-col items-center gap-5 text-gray-400' >
                <Edit className='w-9 h-9 '/>
                <p> Enter a topic and click "Generate article" to get started</p>

              </div>

            </div>

            ) : 
            (
              <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600  prose prose-sm max-w-none'>
  
                <div className='.reset-tw'>
                  <Markdown
                     components={{
                         h1: ({children}) => <h1 className='text-2xl font-extrabold mt-2 mb-3 text-slate-900'>{children}</h1>,
                         h2: ({children}) => <h2 className='text-base font-semibold mt-4 mb-2 text-slate-800'>{children}</h2>,
                         h3: ({children}) => <h3 className='text-sm font-semibold mt-3 mb-1 text-slate-800'>{children}</h3>,
                         p: ({children}) => <p className='mb-3 leading-relaxed text-sm text-slate-600'>{children}</p>,
                         strong: ({children}) => <strong className='font-semibold text-slate-800'>{children}</strong>,
                         ul: ({children}) => <ul className='list-disc pl-5 mb-3 space-y-1'>{children}</ul>,
                         ol: ({children}) => <ol className='list-decimal pl-5 mb-3 space-y-1'>{children}</ol>,
                         li: ({children}) => <li className='leading-relaxed text-sm text-slate-600'>{children}</li>,
                         hr: () => null,
                         em: ({children}) => <em className='italic text-slate-600'>{children}</em>,   
                          }}>
                         {content}
                  </Markdown>
                </div>
                                                                                            

              </div>

            )}
            
      </div>
            
    </div>
  )
}

export default WriteArticle