'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    async function test() {
      const supabase = createClient(); 
      const { data, error } = await supabase
        .from('users')
        .select('*');

      console.log(data, error);
    }

    test();
  }, []);

  return <div>Testing Supabase</div>;
}