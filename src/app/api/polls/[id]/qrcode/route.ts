
import { NextResponse } from 'next/server';
import { createPollShare } from '@/lib/db/polls';
import QRCode from 'qrcode';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    const { searchParams } = new URL(request.url);
    const baseUrl = searchParams.get('baseUrl');

    if (!baseUrl) {
      return NextResponse.json({ error: 'baseUrl is required' }, { status: 400 });
    }

    const share = await createPollShare(pollId);
    const shareUrl = `${baseUrl}/poll/share/${share.share_code}`;

    const qrCode = await QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return NextResponse.json({ success: true, qrCode, shareUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
