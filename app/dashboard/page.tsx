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
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    async function loadPage(userId: string) {
        setLoading(true); 
        try {
            await getLeagues(userId); 
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); 
        }
    }

    async function getLeagues(userId: string) {
        const { data, error } = await supabase
            .from('leagues')
            .select('*')
            .eq('owner_id', userId);

        if (error) {
            console.log("Error getting leagues:", error);
            return;
        }

        console.log("Leagues:", data);
        setLeagues(data);
    }

    useEffect(() => {
        async function getUser() {
            const supabase = createClient(); 
            const {
                data : {user},
            } = await supabase.auth.getUser(); 

            if (user) {
                setEmail(user.email ?? '');
                setUser(user); 
                await loadPage(user.id); 
            } else {
                router.push('/'); 
            }
        }
        getUser(); 
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
            return; 
        }
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
        setLeagueName(''); 
        setLeagueSeason('');
        setShowForm(false); 
    }

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <style>
                    {`
                        @keyframes spin {
                            from {
                                transform: rotate(0deg);
                            }
                            to {
                                transform: rotate(360deg);
                            }
                        }

                        @keyframes loading {
                            0% {
                                transform: translateX(-250%);
                            }
                            100% {
                                transform: translateX(650%);
                            }
                        }
                    `}
                </style>

                <div style={styles.loadingBall}>⚽</div>

                <h1 style={styles.loadingTitle}>
                    Soccer League
                </h1>

                <p style={styles.loadingText}>
                    Preparing the pitch...
                </p>

                <div style={styles.loadingBar}>
                    <div style={styles.loadingProgress}></div>
                </div>
            </div>
        );
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
                <div style={styles.overlay}> 
                    <form style={styles.form} onSubmit={(e) => {
                        e.preventDefault();
                        addLeague();
                    }}>
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
                    </form>
                </div>
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
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    form: {
        backgroundColor: '#FFFFF0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '400px',
        padding: '30px',
        borderRadius: '10px',
        border: '1px solid',
    },
    loadingScreen: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFF0',
    },

    loadingBall: {
        fontSize: '70px',
        animation: 'spin 2s linear infinite',
    },

    loadingTitle: {
        fontSize: '32px',
        marginTop: '20px',
        marginBottom: '10px',
    },

    loadingText: {
        fontSize: '18px',
        color: '#555',
    },

    loadingBar: {
        width: '250px',
        height: '8px',
        backgroundColor: '#ddd',
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: '20px',
    },

    loadingProgress: {
        width: '40%',
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: '10px',
        animation: 'loading 1.5s ease-in-out infinite',
    },
} satisfies Record<string, React.CSSProperties>