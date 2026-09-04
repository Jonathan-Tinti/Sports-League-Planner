'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const supabase = createClient(); 
    const router = useRouter();
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
            router.push('/dashboard'); 
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>
                Welcome to Sports League Planner!
            </h2>
            <input 
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <input 
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signIn} style={styles.button}>
                Login
            </button>
            <button onClick={signUp} style={styles.button}>
                Not Registered? Sign Up!
            </button>
        </div>
    )
}

const styles = {
    container: {
        backgroundColor: '#bfdde2',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
    },
    input: {
        border: '1px solid', 
        borderColor: '#000000', 
        padding: '20px', 
        margin: '10px', 
        borderRadius: '5px',
    }, 
    button: {
        backgroundColor: '#96d2fa',
        border: '1px solid', 
        borderColor: '#000000',
        padding: '10px 20px',
        cursor: 'pointer',
        margin: '5px', 
        borderRadius: '5px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        position: 'sticky',
        top: 0
    }
} satisfies Record<string, React.CSSProperties>