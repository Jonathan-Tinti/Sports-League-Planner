'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type PageProps = {
  params: Promise<{ id: string }>;
};

type Game = {
    home_team_id: string; 
    away_team_id: string; 
    game_date: Date; 
    location: string; 
    home_score: number; 
    away_score: number; 
}; 

export default function EnterGame({params}: PageProps){
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] =  useState(true); 
    const [awayID, setAwayID] = useState(''); 
    const [homeID, setHomeID] = useState(''); 
    const [homeScore, setHomeScore] = useState(0); 
    const [awayScore, setAwayScore] = useState(0);
    

    async function loadPage() {
        try{
            await updateGame(); 
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false); 
        }
    }

    async function updateGame() {
        const {id} = await params; 
        const supabase = createClient(); 
        if (!user){
            return; 
        }

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

    return (
        <div>
            hi 
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
        width: '80%',
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
        margin: '5px', 
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