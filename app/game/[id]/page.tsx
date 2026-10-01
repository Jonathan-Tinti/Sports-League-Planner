'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type PageProps = {
  params: Promise<{ id: string }>;
};

type Game = {
    id: string; 
    league_id: string; 
    home_team: {
       name : string;
    } 
    away_team: {
        name: string; 
    }
    home_team_id: string;
    away_team_id: string; 
    game_date: string; 
    home_score: number; 
    away_score: number; 
}; 

export default function EnterGame({params}: PageProps){
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] =  useState(true); 
    const [homeScore, setHomeScore] = useState(0); 
    const [awayScore, setAwayScore] = useState(0);
    const [game, setGame] = useState<Game>(); 

    async function loadPage() {
        setLoading(true); 
        try{
            await getGame(); 
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false); 
        }
    }

    async function getGame() {
        const {id} = await params; 
        const supabase = createClient(); 
        const { data, error } = await supabase 
            .from('games')
            .select(`
                id, 
                game_date,
                home_score,
                away_score, 
                home_team_id,
                away_team_id,
                home_team:teams!home_team_id(name),
                away_team:teams!away_team_id(name),
                league_id
                `)
            .eq('id', id)
            .single()
        if (error) {
            console.log(error); 
            return; 
        }
        setGame(data);
        setHomeScore(data.home_score ?? 0);
        setAwayScore(data.away_score ?? 0);
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

    async function updateGame(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!user || !game){
            return; 
        }
        const {id} = await params; 
        const supabase = createClient(); 
        const gameDate = new Date(game.game_date);
        const now = new Date();
        if (gameDate > now) {
            console.log("This game has not happened yet.");
            return;
        }
        
        const { data, error } = await supabase
            .from('games')
            .update({
                home_score: homeScore,
                away_score: awayScore
            })
            .eq('id', game.id)
            .select()
            .single();
        if (error) {
            console.log("Error updating game:", error);
            return;
        }
        router.push(`/leagues/${game.league_id}/games`);
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
                    <button onClick={() => router.push(`/leagues/${game?.league_id}/games`)} style={styles.backButton}>←</button>
                </div>
                <div style={styles.navSubContainer}>   
                    <button onClick={() => router.push(`/leagues/${game?.league_id}/members`)} style={styles.backButton}>Contact</button>
                <button onClick={() => router.push(`/leagues/${game?.league_id}/teams`)} style={styles.backButton}>Teams</button>
                </div>
                <div style={styles.dummy} aria-hidden="true"></div>
            </div>
            <div style={styles.container}>
                <div style={styles.subContainer}>
                    <h1 style={styles.title}>{game?.home_team.name} vs {game?.away_team.name}</h1>
                    <h1 style={styles.text}>Score:</h1>
                    <form onSubmit={updateGame} style={styles.form}>
                        <div style={styles.subSubContainer}>
                            <input
                                style={styles.text}
                                type="number"
                                min="0"
                                value={homeScore}
                                onChange={(e) => setHomeScore(parseInt(e.target.value))}
                            />
                            <p>-</p>
                            <input
                                style={styles.text} 
                                type="number"
                                min="0"
                                value={awayScore}
                                onChange={(e) => setAwayScore(parseInt(e.target.value))}
                            />
                        </div>
                        <button type="submit" style={styles.button}>
                            Submit Result
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        backgroundColor: '#eef0f0',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
    },
    subContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 'auto', 
        borderRadius: '10px',
        border: '1px solid',
        margin: '60px'
    }, 
    navContainer: {
        backgroundColor: '#3f414d', 
        display: 'flex',
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center', 
        width: '100%',
        height: '60px',
        borderBottom: '1px solid', 
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
    subSubContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        marginBottom: '10px',
        padding: '5px'
    }, 
    subSubSubContainer: {
        backgroundColor: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '10px',
        padding: '5px',
        borderRadius: '5px',
        border: '1px solid #c9ced6',
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
        textAlign: 'center', 
    }, 
    navbarText: {
        fontSize: '18px', 
        margin: 'auto', 
        color: 'white',
    }, 
    button: {
        backgroundColor: '#d4f7d6',
        border: '1px solid', 
        borderColor: '#000000',
        padding: '10px 20px',
        cursor: 'pointer',
        margin: '5px', 
        marginBottom: '15px',
        borderRadius: '5px',
    },
    backButton: {
        backgroundColor: '#e1edf8',
        border: '1px solid', 
        borderColor: '#000000',
        padding: '5px 10px',
        cursor: 'pointer',
        marginRight: '15px', 
        marginLeft: '15px', 
        top: '15px',
        right: '15px', 
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
    form: {
        backgroundColor: '#FFFFF0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '400px',
        padding: '30px',
        borderRadius: '10px',
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