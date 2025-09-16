import { NextResponse } from 'next/server';
import { getPollByShareCode, getPollResults } from '@/lib/db/polls';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const shareCode = params.code;
    const { searchParams } = new URL(request.url);
    const providedPassword = searchParams.get('password');

    const shareData = await getPollByShareCode(shareCode); 

    if (!shareData) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
    }

    const { pollShare, poll, options } = shareData;

    if (pollShare.expires_at && new Date(pollShare.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 403 });
    }

    if (pollShare.password && providedPassword !== pollShare.password) {
      // TODO: Use a proper password comparison (e.g., bcrypt.compare) after hashing the stored password
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const results = await getPollResults(poll.id);

    const chartData = results.map(result => ({
      name: result.option_text,
      value: result.vote_count,
    }));

    const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0);
    const numericalSummary = results.map(result => ({
      option: result.option_text,
      votes: result.vote_count,
      percentage: totalVotes > 0 ? (result.vote_count / totalVotes) * 100 : 0,
    }));

    const isRealtime = !poll.end_date || new Date(poll.end_date) > new Date();

    return NextResponse.json({ success: true, poll, options, results, chartData, numericalSummary, isRealtime });
  } catch (error) {
    console.error('Error retrieving shared poll results:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
