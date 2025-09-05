import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from '../db/db.js'
import * as table from '../db/schema.js'
import { eq, sql } from 'drizzle-orm'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    message: 'api working fine!'
  })
})

app.get('/:link_name', async (c) => {
  const link_name = c.req.param('link_name');

  const [ link_result ] = await db
    .select()
    .from(table.links)
    .where(eq(table.links.link_name, link_name))
    .limit(1);

  if (link_result == undefined) {
    return c.json({ error: 'link not found' }, 404);
  }

  await db
    .update(table.links)
    .set({
      visits: sql`${table.links.visits} + 1`,
    })
    .where(eq(table.links.link_name, link_name));
  
  return c.redirect(link_result.redirect_to);
})

app.post('/links', async (c) => {
  const { link_name, redirect_to } = await c.req.json();

  if (!link_name || !redirect_to) {
    return c.json({ error: 'link_name and redirect_to are required'}, 400);
  }

  if (!redirect_to.startsWith('http://') && !redirect_to.startsWith('https://')) {
    return c.json({ error: 'redirect_to must be a valid URL starting with http:// or https://' }, 400);
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(link_name)) {
    return c.json({ error: 'link_name can only contain letters, numbers, hyphens, and underscores' }, 400);
  }

  try {
    const link_result = await db
      .insert(table.links)
      .values({ 
        link_name, 
        redirect_to, 
        visits: 0 
      }).returning();

    return c.json({ link_result });
  } catch (error: any) {
    if (error.cause?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return c.json({ error: 'link_name already exists' }, 409);
    }
    return c.json({ error: 'failed to create link'}, 500);
  }
})

app.notFound((c) => {
  return c.text('custom 404 Message', 404); 
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`server is running on http://localhost:${info.port}`);
})
