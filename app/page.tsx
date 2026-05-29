'use client';

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const supabase = createClient(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 

    async function signUp() {
        const { error } = await supabase.auth.signUp({
            email,
            password
        }); 

        if (error) {
            console.log(error.message); 
        } else {
            alert('Check email for confirmation'); 
        }
    }

    async function signIn() {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        }); 

        if (error) {
            console.log(error.message); 
        } else {
            alert('Signed In!'); 
        }
    }

    return (
        <div>
            <input 
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signIn}>
                Login
            </button>
            <button onClick={signUp}>
                Not Registered? Sign Up!
            </button>
        </div>
    )
}