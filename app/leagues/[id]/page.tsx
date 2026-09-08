'use client'; 

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type PageProps = {
  params: Promise<{ id: string }>;
};

type League = {
    id: string,
    name: string, 
    season: string,
    owner_id : string
}

export default function ShowLeagues({ params }: PageProps) {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState(''); 
    const [season, setSeason] = useState(''); 
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
      async function getLeague() {
        const { id } = await params;
        const supabase = createClient(); 
        const { data, error } = await supabase
            .from('leagues')
            .select('*')
            .eq('id', id); 
        if (error) {
            return; 
        }
        setName(data.name); 
        
      }
      getUser();
      getLeague(); 
    }, []); 

    
}