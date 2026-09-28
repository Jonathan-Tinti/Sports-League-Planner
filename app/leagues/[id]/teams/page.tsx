'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import AddTeamForm from '@/components/AddTeamForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

type Team = {
    id: string;
    name: string; 
}; 

export default function ShowTeams({ params }: PageProps){
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [teams, setTeams] = useState<Team[]>([]); 
    const [isOwner, setIsOwner] = useState(false); 
    const [showForm, setShowForm] = useState(false); 
    const [loading, setLoading] =  useState(true); 
    const [leagueID, setLeagueID] = useState('');

    async function loadPage() {
        setLoading(true); 
        try {
            await getTeams(); 
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); 
        }
    }

    async function getTeams () {
        const { id } = await params; 
        setLeagueID(id); 
        const supabase = createClient(); 
        const { data, error } = await supabase
            .from('teams')
            .select(`
                id,
                name
                `)
            .eq('league_id', id)
        if (error) {
            console.log("Team error:", error); 
        }
        setTeams(data); 
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
            const { data, error } = await supabase 
                .from('league_members')
                .select('role')
                .eq('user_id', user.id)
                .select()
                .single()
            if (error) {
                console.log(error);
                return; 
            }
            if (data.role == 'owner') {
                setIsOwner(true)
            }
        }
        }
        getUser();
    }, []); 

    async function addTeam(teamName: string) {
        const {id} = await params; 
        if (!user){
            return; 
        }
        const { data, error } = await supabase
            .from('teams')
            .insert({
                league_id: id,
                name: teamName
            })
            .select()
            .single()
        if (error) {
            console.log(error); 
            return; 
        }
        setTeams(prevTeams => [...prevTeams, data]); 
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
        <div>
            <div style={styles.navContainer}>
                <div style={styles.dummy}>
                    <button onClick={() => router.push(`/leagues/${leagueID}`)} style={styles.navButton}>←</button>
                </div>
                <div style={styles.navSubContainer}>   
                    <button onClick={() => router.push(`/leagues/${leagueID}/members`)} style={styles.navButton}>Contact</button>
                    <button onClick={() => router.push(`/leagues/${leagueID}/games`)} style={styles.navButton}>Games</button>
                </div>
                <div style={styles.dummy} aria-hidden="true"></div>
            </div>
            <div style={styles.container}>
                <div style={styles.subContainer}>
                    <h1 style={styles.title}>Teams</h1>
                    {isOwner && ( 
                        <button style={styles.button} onClick={() => setShowForm(true)}>
                            Create Team
                            </button> 
                    )}
                    <div style={styles.subSubContainer}>
                        {teams.map((team) => (
                            <div key={team.id} style={styles.subSubContainer}>
                                <div style={styles.subSubSubContainer}>
                                    <p>Name: {team.name}</p>
                                    <button style={styles.subButton} onClick={() => router.push(`/team/${team.id}`)}>Visit</button> 
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
                {showForm && (
                    <AddTeamForm
                        onAddTeam={addTeam}
                        onCancel={() => setShowForm(false)}
                    />
                )}
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
        paddingLeft: '200px',
        paddingRight: '200px'
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
        
        margin: '60px', 
    }, 
    subSubContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        
        margin: '10px',
        padding: '5px'
    }, 
    subSubSubContainer: {
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '10px',
        border: '1px solid',
        borderRadius: '10px',
        padding: '5px'
    }, 
    text: {
        fontSize: '18px', 
        margin: '5px', 
    }, 
    navbarText: {
        fontSize: '18px', 
        margin: 'auto', 
        color: 'white',
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
    subButton: {
        backgroundColor: '#eff5fb',
        paddingRight: '10px',
        paddingLeft: '10px',
        cursor: 'pointer',
        marginTop: '10px', 
        borderRadius: '5px',
    }, 
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        position: 'relative',
        marginTop: '10px', 
        marginBottom: '10px', 
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