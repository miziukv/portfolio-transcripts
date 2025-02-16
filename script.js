import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// For local dev or Next.js environment variables, you might do:
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// However, in a pure static environment with no build step, you can't directly read .env.
// You could either embed the variables or do some server injection. For demonstration:
const supabaseUrl = "https://nmbhuslopiadpzouyjpz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tYmh1c2xvcGlhZHB6b3V5anB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NzEwMDksImV4cCI6MjA1NTI0NzAwOX0.eYi-hvp5Bo5BZfxsX4BtLd0uYk2jgiwg3SwddynjDWA";

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Grab references to our DOM elements
const usersListEl = document.getElementById("users-list");
const chatContainerEl = document.getElementById("chat-container");
const selectedUserEl = document.getElementById("selected-user");

// When the page loads, fetch distinct user IDs
window.addEventListener("DOMContentLoaded", async () => {
  await loadUserIds();
});

// Fetch distinct user_id from chat_transcripts
async function loadUserIds() {
  // Example: load all user_id from chat_transcripts
  const { data, error } = await supabase
    .from("chat_transcripts")
    .select("user_id");

  if (error) {
    console.error("Error fetching user IDs:", error);
    return;
  }

  // Distill to distinct values
  const distinctUserIds = [...new Set(data.map((row) => row.user_id))];

  // Render them in the sidebar
  usersListEl.innerHTML = "";
  distinctUserIds.forEach((uid) => {
    const div = document.createElement("div");
    div.className = "user-item";
    div.textContent = uid;
    div.onclick = () => loadChatForUser(uid);
    usersListEl.appendChild(div);
  });
}

// When a user in sidebar is clicked, fetch chat transcripts for that user
async function loadChatForUser(userId) {
  selectedUserEl.textContent = `Chat for: ${userId}`;

  // Fetch all messages for that user, ordered by timestamp
  const { data, error } = await supabase
    .from("chat_transcripts")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching transcripts:", error);
    return;
  }

  // Clear chat container
  chatContainerEl.innerHTML = "";

  // Render each row as a chat bubble
  data.forEach((msg) => {
    const msgEl = document.createElement("div");
    msgEl.classList.add("chat-message", msg.sender);

    // message text
    msgEl.textContent = msg.message;

    // meta info
    const metaEl = document.createElement("div");
    metaEl.className = "meta-info";
    // Show id, sender, and a user-friendly timestamp
    metaEl.textContent = `id: ${msg.id} | ${msg.sender} at ${new Date(msg.timestamp).toLocaleString()}`;

    // combine them in a wrapper
    const wrapper = document.createElement("div");
    wrapper.appendChild(msgEl);
    wrapper.appendChild(metaEl);

    chatContainerEl.appendChild(wrapper);
  });
}
