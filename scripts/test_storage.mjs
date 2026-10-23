import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
console.log('Buckets:', JSON.stringify(buckets, null, 2), 'Error:', bErr);

const { data: cols, error: cErr } = await supabase.from('collections').select('*');
console.log('Collections count:', cols?.length, 'Error:', cErr);
if (cols && cols.length > 0) {
  console.log('Sample collection:', cols[0]);
}

// Test createSignedUploadUrl for product-images
const { data: signedData, error: sErr } = await supabase.storage.from('product-images').createSignedUploadUrl('test-path.jpg');
console.log('Signed upload URL result:', signedData, 'Error:', sErr);
