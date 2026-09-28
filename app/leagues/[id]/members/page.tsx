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

export default function ShowMembers({ params }: PageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [members, setMembers] = useState<Member[]>([]); 
    const [isOwner, setIsOwner] = useState(false); 
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] =  useState(true); 
    const [leagueID, setLeagueID] = useState('');

    async function loadPage() {
        setLoading(true); 
        try {
            await getMembers();  
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); 
        }
    }

    async function getMembers(){
        const { id } = await params;
        setLeagueID(id); 
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
                    <button onClick={() => router.push(`/leagues/${leagueID}/teams`)} style={styles.navButton}>Teams</button>
                    <button onClick={() => router.push(`/leagues/${leagueID}/games`)} style={styles.navButton}>Games</button>
                </div>
                <div style={styles.dummy} aria-hidden="true"></div>
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
                {/* {showForm && (
                    
                )} */}
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
        justifyContent: 'center',
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
        paddingLeft: '25px',
        paddingRight: '25px'
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        border: '1px solid',
        marginBottom: '10px',
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