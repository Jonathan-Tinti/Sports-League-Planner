'use client';

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type League = {
    id: string,
    name: string, 
    season: string,
    owner_id : string
}

export default function Dashboard() {
    const [email, setEmail] = useState('');
    const [user, setUser] = useState<User | null>(null); 
    const [leagues, setLeagues] = useState<League[]>([]); 
    const [leagueName, setLeagueName] = useState('');
    const [leagueSeason, setLeagueSeason] = useState('');
    const [showForm, setShowForm] = useState(false); 
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function getUser() {
            const supabase = createClient(); 
            const {
                data : {user},
            } = await supabase.auth.getUser(); 

            if (user) {
                setEmail(user.email ?? '');
                setUser(user); 
            } else {
                router.push('/'); 
            }
        }
        async function getLeagues() {
            if (!user) {
                return; 
            }
            const { data, error } = await supabase
                .from('leagues')
                .select('*')
                .eq('user_id', user.id);
            
            if (error) {
                return; 
            }
            setLeagues(data); 
        }
        getUser(); 
        getLeagues(); 
    }, []); 

    async function addLeague() {
        if (!user) {
            return; 
        }
        const { data, error } = await supabase 
            .from('leagues')
            .insert({
                name: leagueName,
                season: leagueSeason,
                owner_id: user.id
            })
            .select()
            .single()
        if (error) {
            console.log(error); 
        }
        console.log(data); 
        setLeagues([...leagues, data]); 
        const { data: member, error: memberError } = await supabase 
            .from('league_members')
            .insert({
                league_id: data.id,
                user_id: user.id,
                role: 'owner'
            })
        if (memberError){
            console.log(memberError); 
        }
        console.log(member); 
    }
    
    return (
        <main style={styles.container}>
            <h1>Soccer League</h1>
            <p>Welcome!</p>
            <p>Logged in as: {email}</p>
            <h2>Your Leagues:</h2>
            {leagues.map((league) => (
                <div key={league.id}>
                    <h2>{league.name}</h2>
                    <p>{league.season}</p>
                </div>
            ))}
            <button onClick={() => setShowForm(true)}>
                Create League?????
            </button>
            {showForm && (
                <form>
                    <input
                        type="text"
                        placeholder="League name"
                    />
                    <input
                        type="text"
                        placeholder="Season"
                    />
                    <button type="submit" onClick={() => addLeague()}>
                        Create
                    </button>
                    <button onClick={() => setShowForm(false)}>
                        Cancel
                    </button>
                </form>
            )}
        </main>
    )

}

const styles = {
    container: {
        backgroundColor: '#FFFFF0',
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
        backgroundColor: '#f3e6f3',
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