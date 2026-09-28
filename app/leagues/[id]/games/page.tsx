'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import AddGameForm from '@/components/AddGameForm';
import { useParams } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
};

type Game = {
    id: string; 
    home_team: {
        name: string; 
    };
    home_score: number;
    away_team: {
        name: string; 
    }; 
    away_score: number; 
    game_date: Date; 
    location: string; 

}; 

type Team = {
    id: string;
    name: string; 
}; 

export default function ShowGames({ params }: PageProps){
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [games, setGames] = useState<Game[]>([]); 
    const [isOwner, setIsOwner] = useState(false); 
    const [showGForm, setGShowForm] = useState(false); 
    const [loading, setLoading] =  useState(true); 
    const [teams, setTeams] = useState<Team[]>([]); 
    const { id: leagueID } = useParams<{ id: string }>();

    async function loadPage() {
        setLoading(true); 
        try {
            await getGames(); 
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); 
        }
    }

    async function getGames () {
        const { id } = await params;
        const supabase = createClient(); 
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase 
            .from('games')
            .select(`
                home_team(name),
                away_team (name),
                game_date, 
                location,
                `)
            .eq('league_id', id)
            .gte('game_date', today)
            .order('game_date', { ascending: false });
        setGames(data); 
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
                .eq('league_id', leagueID)
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

    async function addGame(homeId: string,
    awayId: string,
    date: Date,
    location: string) {
        if (!user){
            return; 
        }
        const { data, error } = await supabase
            .from('games')
            .insert({
                home_id: homeId,
                away_id: awayId,
                game_date: date,
                location: location, 
            })
            .select()
            .single()
        if (error) {
            console.log(error); 
            return; 
        }
        setGames(prevTeams => [...prevTeams, data]); 
        setGShowForm(false);
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
                    <button onClick={() => router.push(`/leagues/${leagueID}/teams`)} style={styles.navButton}>Teams</button>
                </div>
                <div style={styles.dummy} aria-hidden="true"></div>
            </div>
            <div style={styles.container}>
                <div style={styles.subContainer}>
                    <h1 style={styles.title}>Games</h1>
                    {isOwner && (
                        <button style={styles.button} onClick={() => setGShowForm(true)}>
                            Create Game
                        </button>
                    )}
                    <div style={styles.subSubContainer}>
                        {(games ?? []).map((game) => (
                            <div key={game.id}>
                                <p>Game: {game.home_team?.name} vs {game.away_team?.name}</p>
                                <p>Date: {game?.game_date.toLocaleDateString()}</p>
                                <p>Address: {game?.location}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {showGForm && (
                    <AddGameForm
                        teams={teams}
                        onAddGame={addGame}
                        onCancel={() => setGShowForm(false)}
                    />
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        backgroundColor: '#eef0f0',
        display: 'flex', 
        flexDirection: 'row',
        height: '100vh',
        width: '100vw',
        justifyContent: 'center'
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
        border: '1px solid',
        margin: '60px', 
    }, 
    subSubContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        border: '1px solid',
        marginBottom: '10px',
        padding: '5px'
    }, 
    subSubSubContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
        // marginRight: '200px', 
        // marginLeft: '200px', 
        top: '15px',
        right: '15px', 
        borderRadius: '5px',
    }, 
    subButton: {
        backgroundColor: '#eff5fb',
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