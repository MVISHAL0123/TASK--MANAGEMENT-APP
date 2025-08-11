import { NextRequest, NextResponse } from 'next/server';

// In-memory activity log (for demo; resets on server restart)
let activityLog: Array<{
  id: string;
  user: string;
  action: string;
  timestamp: string;
}> = [];

export async function GET() {
  // Return the 20 most recent activities, newest first
  return NextResponse.json(activityLog.slice(0, 20));
}

export async function POST(req: NextRequest) {
  const { user, action } = await req.json();
  if (!user || !action) {
    return NextResponse.json({ error: 'Missing user or action' }, { status: 400 });
  }
  const newActivity = {
    id: Date.now().toString(),
    user,
    action,
    timestamp: new Date().toISOString(),
  };
  activityLog = [newActivity, ...activityLog].slice(0, 20);
  return NextResponse.json(newActivity, { status: 201 });
} 