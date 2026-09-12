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
    const [isLoading, setIsLoading] = useState(true);
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
        getUser(); 
    }, []); 

    useEffect(() => {
        async function getLeagues() {
            if (!user) {
                return;
            }

            const { data, error } = await supabase
                .from('leagues')
                .select('*')
                .eq('owner_id', user.id);

            if (error) {
                console.log("Error getting leagues:", error);
                return;
            }

            console.log("Leagues:", data);
            setLeagues(data);
        }

        getLeagues();
    }, [user]);

    async function addLeague() {
        console.log("addLeague was called")
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
            return; 
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
            return; 
        }
        console.log(member); 
    }
    
    return (
        <div style={styles.container}>
            <div style={styles.subContainer}>
                <h1 style={styles.title}>Soccer League</h1>
                <p style={styles.text}>Welcome!</p>
                <p style={styles.text}>Logged in as: {email}</p>
                <h2 style={styles.subTitle}>Your Leagues:</h2>
                <div style={styles.leagueContainer}>
                    {leagues.map((league) => (
                        <div key={league.id} style={styles.subSubContainer}>
                            <h2>Name: {league.name}</h2>
                            <p>Season: {league.season}</p>
                            <button onClick={() => router.push(`/leagues/${league.id}`)} style={styles.subButton}>
                                Visit
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={() => setShowForm(true)} style={styles.button}>
                    Create League
                </button>
            </div>
            {showForm && (
                <form style={styles.container} onSubmit={(e) => {
                    e.preventDefault();
                    addLeague();
                }}>
                    <div style={styles.subContainer}>
                        <h1 style={styles.title}>
                            League Form
                        </h1>
                        <input
                            type="text"
                            placeholder="League name"
                            style={styles.input}
                            onChange={(e) => setLeagueName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Season"
                            style={styles.input}
                            onChange={(e) => setLeagueSeason(e.target.value)}
                        />
                        <div>
                            <button type="submit" style={styles.button}>
                                Create
                            </button>
                            <button onClick={() => setShowForm(false)} style={styles.button}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    )

}

const styles = {
    container: {
        backgroundColor: '#eef0f0',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
    },
    subContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%',
        height: 'auto', 
        borderRadius: '10px',
        border: '1px solid'
    }, 
    leagueContainer: {
        display: 'flex',
        flexDirection: 'row',  
    }, 
    subSubContainer: {
        backgroundColor: '#f0f6fb', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        border: '1px solid',
        marginBottom: '10px',
        padding: '5px'
    }, 
    input: {
        backgroundColor: '#fdfefe', 
        border: '1px solid', 
        borderColor: '#000000', 
        padding: '10px', 
        margin: '10px 20px', 
        borderRadius: '5px',
    }, 
    text: {
        fontSize: '18px', 
        margin: '5px', 
    }, 
    button: {
        backgroundColor: '#e1edf8',
        border: '1px solid', 
        borderColor: '#000000',
        padding: '10px 20px',
        cursor: 'pointer',
        margin: '5px', 
        marginBottom: '15px',
        borderRadius: '5px',
    },
    subButton: {
        backgroundColor: '#f5faef',
        border: '1px solid', 
        borderColor: '#000000',
        padding: '5px 10px',
        cursor: 'pointer',
        margin: '3px', 
        marginBottom: '5px',
        borderRadius: '5px',
    }, 
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        position: 'relative',
        marginTop: '10px', 
        top: 0
    }, 
    subTitle: {
        fontSize: '24px',
        position: 'relative',
        top: 0,
        margin: '10px'
    }, 
} satisfies Record<string, React.CSSProperties>