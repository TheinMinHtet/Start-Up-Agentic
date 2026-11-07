import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import {
  agentRefinements,
  agentMarketResearch,
  agentFinanceModels,
  agentBrandPackages,
  agentDigitalPresence,
  agentGrowthPlans,
  agentBusinessPlans,
} from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const tableMap: Record<string, any> = {
  agent_refinements: agentRefinements,
  agent_market_research: agentMarketResearch,
  agent_finance_models: agentFinanceModels,
  agent_brand_packages: agentBrandPackages,
  agent_digital_presence: agentDigitalPresence,
  agent_growth_plans: agentGrowthPlans,
  agent_business_plans: agentBusinessPlans,
};

// GET: fetch refinements list (dashboard history) or specific agent table rows
export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table') || 'agent_refinements';
    const ideaId = searchParams.get('ideaId');
    const isHistory = searchParams.get('history') === 'true';

    const targetTable = tableMap[table];
    if (!targetTable) {
      return NextResponse.json({ error: `Unknown table: ${table}` }, { status: 400 });
    }

    if (isHistory) {
      if (!userId) {
        return NextResponse.json({ data: [] });
      }
      const records = await db
        .select({
          idea_id: agentRefinements.idea_id,
          created_at: agentRefinements.created_at,
          improved_summary: agentRefinements.improved_summary,
          concept: agentRefinements.concept,
        })
        .from(agentRefinements)
        .where(eq(agentRefinements.user_id, userId))
        .orderBy(desc(agentRefinements.created_at));

      return NextResponse.json({ data: records });
    }

    if (!ideaId) {
      return NextResponse.json({ error: 'ideaId parameter is required' }, { status: 400 });
    }

    const conditions = [eq(targetTable.idea_id, ideaId)];
    if (userId) {
      conditions.push(eq(targetTable.user_id, userId));
    }

    const records = await db
      .select()
      .from(targetTable)
      .where(and(...conditions))
      .orderBy(desc(targetTable.created_at))
      .limit(1);

    return NextResponse.json({ data: records[0] || null });
  } catch (error: any) {
    console.error('Failed to query agent table:', error);
    return NextResponse.json({ error: error?.message || 'Database query error' }, { status: 500 });
  }
}

// POST: insert or save agent output
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await req.json();
    const { table, payload } = body;

    const targetTable = tableMap[table];
    if (!targetTable) {
      return NextResponse.json({ error: `Unknown table: ${table}` }, { status: 400 });
    }

    const recordData = {
      ...payload,
      user_id: payload.user_id || userId || 'anonymous',
    };

    const inserted = (await db.insert(targetTable).values(recordData).returning()) as any[];

    return NextResponse.json({ success: true, data: inserted[0] });
  } catch (error: any) {
    console.error('Failed to save agent output:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save record' }, { status: 500 });
  }
}
