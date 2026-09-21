'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AddTeamForm from '@/components/AddTeamForm';
import AddGameForm from '@/components/AddGameForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

type Member = {
    user_id: string;
    role: string;
    users: {
        name: string;
        email: string;
    };
}; 

type Team = {
    id: string;
    name: string; 
}; 

type Game = {
    id: string; 
    home_team: {
        name: string; 
    };
    away_team: {
        name: string; 
    }; 
    game_date: Date; 
    location: string; 
}; 

export default function ShowLeagues({ params }: PageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState(''); 
    const [season, setSeason] = useState(''); 
    const [members, setMembers] = useState<Member[]>([]); 
    const [teams, setTeams] = useState<Team[]>([]); 
    const [games, setGames] = useState<Game[]>([]); 
    const [showForm, setShowForm] = useState(false); 
    const [showGForm, setGShowForm] = useState(false); 
    const [loading, setLoading] =  useState(true); 

    async function loadPage() {
        setLoading(true); 
        try {
            await getLeague(); 
            await getMembers(); 
            await getTeams(); 
            await getGames(); 
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); 
        }
    }

    async function getLeague() {
        const { id } = await params;
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
    async function getMembers(){
        const { id } = await params;
        const supabase = createClient(); 
        const { data, error } = await supabase
            .from('league_members')
            .select(`
                user_id,
                role,
                users (
                    name,
                    email
                )
            `)
            .eq('league_id', id)
        if (error) {
            console.log("Member error:", error);
            return; 
        }
        setMembers(data);
    }
    async function getTeams () {
        const { id } = await params; 
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

    async function addGame(homeId: string,
    awayId: string,
    date: Date,
    location: string) {
        const {id} = await params; 
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
                <button onClick={() => router.push('/dashboard')} style={styles.backButton}>←</button>
                <p style={styles.navbarText}>Name: {name}</p>
                <p style={styles.navbarText}>Season: {season}</p>
            </div>
            <div style={styles.container}>
                <div style={styles.subContainer}>
                    <h1 style={styles.title}>Members</h1>
                    <div style={styles.subSubContainer}>
                        {members.map((member) => (
                            <div key={member.user_id}>
                                <p>Name: {member.users?.name}</p>
                                <p>Email: {member.users?.email}</p>
                                <p>Role: {member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={styles.subContainer}>
                    <h1 style={styles.title}>Teams</h1>
                    <button style={styles.button} onClick={() => setShowForm(true)}>Create Team</button>
                    <div style={styles.subSubContainer}>
                        {teams.map((team) => (
                            <div key={team.id} style={styles.subSubSubContainer}>
                                <p>Name: {team.name}</p>
                                <button style={styles.backButton} onClick={() => router.push(`/teams/${team.id}`)}>Visit</button> 
                            </div>
                        ))}
                    </div>
                </div>
                <div style={styles.subContainer}>
                    <h1 style={styles.title}>Games</h1>
                    <button onClick={() => setGShowForm(true)}>
                        Create Game
                    </button>
                    <div style={styles.subSubContainer}>
                        {games.map((game) => (
                            <div key={game.id}>
                                <p>Game: {game.home_team?.name} vs {game.away_team?.name}</p>
                                <p>Date: {game?.game_date.toLocaleDateString()}</p>
                                <p>Address: {game?.location}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {showForm && (
                    <AddTeamForm
                        onAddTeam={addTeam}
                        onCancel={() => setShowForm(false)}
                    />
                )}
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
    subContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        width: '40%',
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