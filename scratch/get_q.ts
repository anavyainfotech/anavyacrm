import { db } from '../src/lib/db';
import { quotations } from '../src/lib/db/schema';
import { desc } from 'drizzle-orm';
async function t() {
  const q = await db.select().from(quotations).orderBy(desc(quotations.createdAt)).limit(1);
  console.log('items type:', typeof q[0].items);
  console.log('items raw:', q[0].items);
  console.log('terms raw:', q[0].terms);
  process.exit(0);
}
t();
