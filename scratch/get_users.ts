import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
async function t() {
  const u = await db.select().from(users);
  console.log(u);
  process.exit(0);
}
t();
