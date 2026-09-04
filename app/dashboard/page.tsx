'use client';

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';


export default function Dashboard() {
    const [email, setEmail] = useState('');
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            const supabase = createClient(); 
            const {
                data : {user},
            } = await supabase.auth.getUser(); 

            if (user) {
                setEmail(user.email ?? '');
            }
        }
        getUser(); 
    }, []); 

    async function getLeagues() {
        const { data, error } = await supabase
            .from('leagues')
            .select('*'); 
    }
    
    return (
        <main>
            <h1>Soccer League</h1>
            <p>Welcome!</p>
            <p>Logged in as: {email}</p>
            <h2>Your Leagues:</h2>
        </main>
    )

}