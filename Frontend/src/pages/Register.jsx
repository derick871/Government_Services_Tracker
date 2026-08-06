import React from 'react'
import { useState } from 'react'

export default  function register(){
    const[Email,setEmail]= useState(" ");
    const[password,setPassword]= useState(" ");

    const registerUser= async (e)=> {
        e.preventDefault();
        alert("User Registered successfully")
    }

    return (
    <div className="bg:slate-750, m-10">
        <form
        onSubmit={Register}>
            <h2>
                Citizen Register
            </h2>
            <input type="email" 
            placeholder="Email"
          className="w-full border p-2 mb-4"
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input type="password"
        placeholder="Password"
        className="w-full border p-2 mb-4"
        onChange={(e)=>setPassword(e.target.value)}
        />
        <button type="submit" className="bg:amber-500, text-white, p-2, rounded-md">
            Register
        </button>
        </form>
    </div>

)
}



