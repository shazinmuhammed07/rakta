import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].trim().replace(/^"|"$|'\r'/g, '');
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
    console.log("Testing Supabase connection...");
    const { data: users, error: ue } = await supabase.from('users').select('*').limit(1);
    console.log('Users table result:', users ? 'Found columns: ' + Object.keys(users[0] || {}).join(', ') : 'No data');
    if (ue) console.error('Users error:', ue);

    const { data: reqs, error: re } = await supabase.from('requests').select('*').limit(1);
    console.log('Requests table result:', reqs ? 'Found columns: ' + Object.keys(reqs[0] || {}).join(', ') : 'No data');
    if (re) console.error('Requests error:', re);
}
main();
