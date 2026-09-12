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
    }[];
}; 

export default function ShowLeagues({ params }: PageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState(''); 
    const [season, setSeason] = useState(''); 
    const [members, setMembers] = useState<Member[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
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
            console.log("MEMBERS DATA:", data);
            console.log("MEMBERS ERROR:", error);
            if (error) {
                console.log("Member error:", error);
                return; 
            }
            setMembers(data);
        }
        getLeague(); 
        getMembers(); 
    }, [user]); 

    return (
        <div style={styles.container}>
            <button onClick={() => router.push('/dashboard')} style={styles.button}>←</button>
            <div style={styles.subContainer}>
                <div style={styles.leagueContainer}>
                    <p style={styles.navbarText}>Name: {name}</p>
                    <p style={styles.navbarText}>Season: {season}</p>
                </div>
                <div style={styles.subContainer}>
                    {members.map((member) => (
                        <div key={member.user_id}>
                            <p>{member.users[0]?.name}</p>
                            <p>{member.users[0]?.email}</p>
                            <p>{member.role}</p>
                        </div>
                    ))}
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
        margin: '5px', 
        marginRight: '30px',
        marginLeft: '30px'
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