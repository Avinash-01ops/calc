import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://aykuhjiruwcyxpybgweo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5a3VoamlydXdjeXhweWJnd2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjgyMjIsImV4cCI6MjA3NDIwNDIyMn0.NEG2qVqSd_-w2X_eozMLQLJbZ7_9vrSQVkWfk_U4-fg'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey)
}
