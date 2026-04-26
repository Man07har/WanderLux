import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://aimmabcjcmqxhjiobjus.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbW1hYmNqY21xeGhqaW9ianVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODQyNTAsImV4cCI6MjA5Mjc2MDI1MH0.0pDzgiD5WhrceUo0EFPC178-jzEa9a0vcbKJT6rCkmo'
);

async function run() {
  // Sign in as user 3 first to get ID
  const { data: { user: user3 } } = await supabase.auth.signInWithPassword({
    email: 'test3@wander.lux',
    password: 'password123'
  });

  // Then sign in as user 2 so the active session is user 2!
  const { data: { user: user2 } } = await supabase.auth.signInWithPassword({
    email: 'testuser2@wander.lux',
    password: 'password123'
  });

  if (user2 && user3) {
    const { data, error: msgErr } = await supabase.from('messages').insert({
        sender_id: user2.id,
        recipient_id: user3.id,
        body: "Hey Test User, I saw your new post!"
    }).select();
    console.log("Message insertion data:", data, "Error:", msgErr?.message);
    
    // Now verify we can read it
    const { data: readData } = await supabase.from('messages').select('*').limit(1);
    console.log("Can read message?", readData?.length > 0);
  }
}

run();
