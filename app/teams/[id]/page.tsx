'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type PageProps = {
  params: Promise<{ id: string }>;
};

type Player = {
    id: string; 
    first_name: string; 
    last_name: string; 
    jersey: number; 
}; 

export default function ShowPlayers({params}: PageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState(''); 
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerFName, setPlayerFName] = useState(''); 
    const [playerLName, setPlayerLName] = useState(''); 
    const [jersey, setJersey] = useState(0); 
    const [showForm, setShowForm] = useState(false); 
    useEffect(() => {
        async function getUser() {
            const supabase = createClient(); 
            const {
                data : {user},
            } = await supabase.auth.getUser(); 

            if (!user) {
                router.push('/'); 
            } else {
                setUser(user); 
            }
        }
        getUser();
    }, []); 

    useEffect(() => {
        async function getTeam() {
            const {id} = await params; 
            const { data, error } = await supabase 
                .from('teams')
                .select('*')
                .eq('id', id)
                .single()
            if (error) {
                console.log(error);
                return; 
            }
            setName(data.name); 
        }
        async function getPlayers() {
            const {id} = await params; 
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('team_id', id)

            if (error) {
                console.log(error);
                return; 
            }
            setPlayers(data); 
        }
        getTeam(); 
        getPlayers(); 
    }, [user]); 

    async function addTeam() {
        const {id} = await params; 
        if (!user){
            return; 
        }

        const { data, error } = await supabase
            .from('players')
            .insert({
                team_id: id, 
                first_name: playerFName,
                last_name: playerLName,
                jersey: jersey
            })
            .select()
            .single()
        if (error) {
            console.log(error); 
            return; 
        }
        setPlayers(prevPlayers => [...prevPlayers, data]); 
        setPlayerFName('');
        setPlayerLName(''); 
        setJersey(0); 
    }

    return (
        <div>
            <div style={styles.navContainer}>
                <button onClick={() => router.push(`/dashboard`)} style={styles.backButton}>←</button>
                <p style={styles.navbarText}>Name: {name}</p>
            </div>
            <div style={styles.container}>
                <div style={styles.subContainer}>
                    <h1 style={styles.title}>Players</h1>
                    <div style={styles.subSubContainer}>
                        {players.map((player) => (
                            <div key={player.id}>
                                <p>Name: {player.first_name} {player.last_name}</p>
                                <p>Jersey: {player.jersey}</p>
                            </div>
                        ))}
                    </div>
                    <button style={styles.button} onClick={() => setShowForm(true)}>Add Player</button>
                </div>
                {showForm && (
                    <div style={styles.overlay}> 
                        <form style={styles.form} onSubmit={(e) => {
                                e.preventDefault();
                                addTeam();
                            }}>
                                <h1 style={styles.title}>
                                    Player Form
                                </h1>
                                <input
                                    type="text"
                                    placeholder="First name"
                                    style={styles.input}
                                    value={playerFName}
                                    onChange={(e) => setPlayerFName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Last name"
                                    style={styles.input}
                                    value={playerLName}
                                    onChange={(e) => setPlayerLName(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Jesery number"
                                    style={styles.input}
                                    value={jersey}
                                    onChange={(e) => setJersey(e.target.valueAsNumber)}
                                />
                                <div>
                                    <button type="submit" style={styles.button}>
                                        Create
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)} style={styles.button}>
                                        Cancel
                                    </button>
                                </div>
                        </form>
                    </div>
                )}
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
} satisfies Record<string, React.CSSProperties>