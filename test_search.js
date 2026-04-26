import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://aimmabcjcmqxhjiobjus.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbW1hYmNqY21xeGhqaW9ianVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODQyNTAsImV4cCI6MjA5Mjc2MDI1MH0.0pDzgiD5WhrceUo0EFPC178-jzEa9a0vcbKJT6rCkmo'
);

async function run() {
  const { data: allProfiles, error: err1 } = await supabase.from('profiles').select('*');
  console.log("All Profiles Count:", allProfiles?.length);
  if (allProfiles) {
    allProfiles.forEach(p => console.log("Profile:", p.handle, p.display_name));
  }

  const { data: searchResults, error: err2 } = await supabase.from('profiles')
    .select('id, handle, display_name')
    .or("handle.ilike.%test%,display_name.ilike.%test%");
  
  console.log("Search Results (handle.ilike.%test%):", searchResults, "\nError:", err2);
}

run();
