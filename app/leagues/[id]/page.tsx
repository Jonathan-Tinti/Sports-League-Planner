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
        setTeams([...teams, data]); 
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
                    <div style={styles.subSubContainer}>
                        {teams.map((team) => (
                            <div key={team.id}>
                                <p>Name: {team.name}</p>
                                <button>Visit</button> 
                            </div>
                        ))}
                    </div>
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
    leagueContainer: {
        display: 'flex',
        flexDirection: 'row', 
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
        margin: '15px', 
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
} satisfies Record<string, React.CSSProperties>