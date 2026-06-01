
import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import {v2 as cloudinary} from 'cloudinary';
import axios from "axios";
import fs from "fs";
import pdf from 'pdf-parse';



const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// generate article from prompt
export const generateArticle = async ( req , res) => {
    try {
        const { userId} = req.auth();
        const {prompt, lenght} = req.body;
        const  plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10){
            return res.json({ success: false, message:"Limit reached. Upgrade to continue."})
        }
        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [ {
                  role: "user",
                  content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: lenght,
        });
        const content= response.choices[0].message.content
        await sql `INSERT INTO creation (user_id, prompt,content,type) VALUES(${userId}, ${prompt}, ${content}, 
        'article')`;
        if (plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata:{
                    free_usage: free_usage + 1
                }
            })
        }
        res.json({ success: true, content})
         
        
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message:error.message})

    }

}


// generate blog title from prompt
export const generateBlogTitle = async ( req , res) => {
    try {
        const { userId} = req.auth();
        const {prompt} = req.body;
        const  plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10){
            return res.json({ success: false, message:"Limit reached. Upgrade to continue."})
        }
        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [ { role: "user", content: prompt } ],
            temperature: 0.7,
            max_tokens: 800,
        });
        const content= response.choices[0].message.content
        await sql `INSERT INTO creation (user_id, prompt,content,type) VALUES(${userId}, ${prompt}, ${content}, 
        'blog-title')`;
        if (plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata:{
                    free_usage: free_usage + 1
                }
            })
        }
        res.json({ success: true, content})
         
        
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message:error.message})

    }

}
  

// generate image from text
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    console.log("Clipdrop key:", process.env.CLIPDROP_API_KEY ? "Loaded" : "Missing"); //

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          
        },
        responseType: "arraybuffer",
      }
    );
    console.log("Image data received:", data?.byteLength || data?.length);  // 

    const base64Image = `data:image/png;base64,${Buffer.from(data).toString("base64")}`;
    console.log("Uploading to Cloudinary..."); //

    const uploadResult = await cloudinary.uploader.upload(base64Image, { //
            resource_type: "image",//
      });

    console.log("Cloudinary full result:", uploadResult); //

     const secure_url = uploadResult.secure_url;  //
    console.log("Cloudinary uploaded:", secure_url); //

    await sql`
      INSERT INTO creation (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
    
  }  catch (error) {
    console.log("Status:", error.response?.status); //
    console.log("ClipDrop Error:", error.response?.data?.toString()); //
    console.log("Message:", error.message);
    console.log("Full error:", error); //

    res.json({
        success: false,
        message: error.response?.data?.toString() || error.message,
    });

  };
};

// remove image background

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

   
    

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
        transformation: [
            {
                effect: "background_removal",
                background_removal: 'remove_the_background'

            }
        ]
    })


    await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });
    
  }  catch (error) {
    console.log("Message:", error.message);
   

    res.json({
        success: false,
        message: error.response?.data?.toString() || error.message,
    });

  };
};

// remove object 
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

   
    

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });


    await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
    `;

    res.json({ success: true, content: imageUrl });
    
  }  catch (error) {
    console.log("Message:", error.message);
   

    res.json({
        success: false,
        message: error.response?.data?.toString() || error.message,
    });

  };
};


// review resume 
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
     
    const resume  = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }
    if (resume.size > 5 * 1024 * 1024) {
        return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)."})
    }
    const dataBuffer= fs.readFileSync(resume.path)
    const pdfData = await pdf(dataBuffer)

    const prompt= `You are an expert resume reviewer. Analyze the following resume in detail and provide:

      1. Overall Impression
      2. Strengths (with bullet points)
      3. Weaknesses (with bullet points)  
      4. Areas for Improvement (specific suggestions)
      5. ATS (Applicant Tracking System) compatibility

      Be specific, detailed and professional in your feedback.

    Resume content: \n\n${pdfData.text}`


    const response = await AI.chat.completions.create({
        model: "gemini-3-flash-preview",
        messages: [ { role: "user", content: prompt } ],
        temperature: 0.7,
        max_tokens: 2000,
    });
    const content= response.choices[0].message.content

    await sql`
      INSERT INTO creation (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    res.json({ success: true,  content });
    
  }  catch (error) {
    console.log("Message:", error.message);
   

    res.json({
        success: false,
        message: error.response?.data?.toString() || error.message,
    });

  };
};