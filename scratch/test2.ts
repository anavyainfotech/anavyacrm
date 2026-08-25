import { db } from '../src/lib/db';
import { quotations } from '../src/lib/db/schema';
async function test() {
  try {
    await db.insert(quotations).values({
      clientId: 1,
      userId: 1,
      items: '[]',
      subtotal: 0,
      taxTotal: 0,
      total: 0,
      status: 'Sent'
    });
  } catch(e) {
    console.log(e);
  }
  process.exit(0);
}
test();
