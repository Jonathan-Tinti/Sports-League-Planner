'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import "react-datepicker/dist/react-datepicker.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ShowLeagues({ params }: PageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState(''); 
    const [season, setSeason] = useState(''); 
    const [loading, setLoading] =  useState(true); 
    const [leagueID, setLeagueID] = useState(''); 

    async function loadPage() {
        setLoading(true); 
        try {
            await getLeague(); 
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); 
        }
    }

    async function getLeague() {
        const { id } = await params;
        setLeagueID(id); 
        const supabase = createClient(); 
        const { data, error } = await supabase
            .from('leagues')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            return; 
        }
        setName(data.name); 
        setSeason(data.season); 
    }

    useEffect(() => {
      async function getUser() {
        const supabase = createClient(); 
        const {
            data : {user},
        } = await supabase.auth.getUser(); 
        await loadPage(); 
        if (!user) {
            router.push('/'); 
        } else {
            setUser(user); 
        }
      }
      getUser();
    }, []); 

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
        <div>
            <div style={styles.navContainer}>
                <button onClick={() => router.push('/dashboard')} style={styles.navButton}>←</button>
                <button onClick={() => router.push(`/leagues/${leagueID}/members`)} style={styles.navButton}>Contact</button>
                <button onClick={() => router.push(`/leagues/${leagueID}/teams`)} style={styles.navButton}>Teams</button>
                <button onClick={() => router.push(`/leagues/${leagueID}/games`)} style={styles.navButton}>Games</button>
            </div>
            <div style={styles.container}>
                <div style={styles.subContainer}>
                    <div style={styles.subSubContainer}>
                        <p style={styles.title}>Name: {name}</p>
                        <p style={styles.title}>Season: {season}</p>
                    </div>
                    <h1 style={styles.subTitle}>Welcome to {name}!</h1>
                    <p style={styles.text}>
                        We will be competing in the {season} and we look forward to seeing you there!
                        If you want to be added as a player or a coach, contact the owner of the league and they will be able to add you in. 
                    </p>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        backgroundColor: '#eef0f0',
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
    },
    navContainer: {
        backgroundColor: '#3f414d', 
        display: 'flex',
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between', 
        width: '100%',
        height: '60px',
        borderBottom: '1px solid', 
        paddingLeft: '100px',
        paddingRight: '300px'
    }, 
    navSubContainer: {
        backgroundColor: '#3f414d', 
        display: 'flex',
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between', 
        width: '30%',
        height: '60px',
        flex: '1'
    },
    dummy: {
        flex: '1'
    }, 
    subContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        width: '80%',
        height: 'auto', 
        borderRadius: '10px',
        // border: '1px solid',
        margin: '60px', 
    }, 
    subSubContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
        height: 'auto', 
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
    navButton: {
        backgroundColor: '#e1edf8',
        border: '1px solid', 
        borderColor: '#000000',
        padding: '5px 10px',
        cursor: 'pointer',
        top: '15px',
        right: '15px', 
        borderRadius: '5px',
    }, 
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        position: 'relative',
        margin: '10px', 
        top: 0
    }, 
    subTitle: {
        fontSize: '24px',
        position: 'relative',
        top: 0,
        margin: '10px'
    }, 
    text: {
        fontSize: '18px', 
        margin: '5px', 
        padding: '20px'
    }, 
    navbarText: {
        fontSize: '18px', 
        margin: 'auto', 
        color: 'white',
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