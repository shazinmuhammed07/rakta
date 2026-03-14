const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jemt6end0eXNzaG9iZGRzeWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTQ0OTYsImV4cCI6MjA4ODk5MDQ5Nn0.vsgQ0XIhRsdOEXddFlUTlYapG5n2raotJx1Nu2bJVO4';
const url = 'https://mczkzzwtysshobddsybv.supabase.co/rest/v1/?apikey=' + key;

async function main() {
    const res = await fetch(url);
    const data = await res.json();
    console.log('\nusers columns:', Object.keys(data.definitions.users.properties));
    console.log('\nusers column details:', JSON.stringify(data.definitions.users.properties, null, 2));
}
main();
