import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://aimmabcjcmqxhjiobjus.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbW1hYmNqY21xeGhqaW9ianVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODQyNTAsImV4cCI6MjA5Mjc2MDI1MH0.0pDzgiD5WhrceUo0EFPC178-jzEa9a0vcbKJT6rCkmo'
);

async function run() {
  // Login as test3
  const { data: { user }, error: errAuth } = await supabase.auth.signInWithPassword({
    email: 'test3@wander.lux',
    password: 'password123'
  });
  console.log("Auth:", !!user, "Error:", errAuth?.message);
  
  if (!user) return;

  // Make a dummy 1x1 pixel image file blob buffer
  const fileBuffer = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

  const path = `${user.id}/dummy.gif`;
  
  // Try uploading
  const { data, error: upErr } = await supabase.storage.from("posts").upload(path, fileBuffer, {
    contentType: 'image/gif',
    upsert: true
  });
  console.log("Upload:", data, "Error:", upErr?.message);
  
  if (!upErr) {
    const { data: pub } = supabase.storage.from("posts").getPublicUrl(path);
    console.log("Public URL:", pub.publicUrl);

    const { error: insErr, data: insData } = await supabase.from("posts").insert({
        user_id: user.id,
        image_url: pub.publicUrl,
        caption: "Test backend creation",
        location: "Backend land",
    }).select();
    console.log("Post Insert:", insData, "Error:", insErr?.message);
  }
}

run();
