'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

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

export default function ShowLeagues({ params }: PageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState(''); 
    const [season, setSeason] = useState(''); 
    const [members, setMembers] = useState<Member[]>([]); 
    const [teams, setTeams] = useState<Team[]>([]); 
    const [teamName, setTeamName] = useState(''); 
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
        getLeague(); 
        getMembers(); 
        getTeams(); 
    }, [user]); 

    async function addTeam() {
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
        setTeamName('');
        setShowForm(false);
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
                                <button style={styles.backButton}>Visit</button> 
                            </div>
                        ))}
                    </div>
                </div>
                {showForm && (
                    <div style={styles.overlay}> 
                        <form style={styles.form} onSubmit={(e) => {
                                e.preventDefault();
                                addTeam();
                            }}>
                                <h1 style={styles.title}>
                                    Team Form
                                </h1>
                                <input
                                    type="text"
                                    placeholder="Team name"
                                    style={styles.input}
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
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