'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/PageLoader';

export default function LoginPage() {
    const supabase = createClient(); 
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [name, setName] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [isSignUp, setSignUp] = useState(false); 

    async function signUp() {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (error) {
            console.log(error.message);
            return;
        }

        alert('Check email for confirmation');
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
            {isSignUp && (
                <input 
                style={styles.input}
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            )}
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
            {isSignUp ? (
                <>
                    <button onClick={signUp} style={styles.button}>
                        Sign Up
                    </button>

                    <button
                        onClick={() => setSignUp(false)}
                        style={styles.button}
                    >
                        Already have an account? Login
                    </button>
                </>
            ) : (
                <>
                    <button onClick={signIn} style={styles.button}>
                        Login
                    </button>

                    <button
                        onClick={() => setSignUp(true)}
                        style={styles.button}
                    >
                        Not Registered? Sign Up!
                    </button>
                </>
            )}
        </div>
    )
}

const styles = {
    container: {
        backgroundColor: '#e5f4f6',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
    },
    input: {
        backgroundColor: '#fdfefe', 
        border: '1px solid', 
        borderColor: '#000000', 
        padding: '10px', 
        margin: '10px', 
        borderRadius: '5px',
    }, 
    button: {
        backgroundColor: '#f2fbe7',
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