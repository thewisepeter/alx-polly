import { NextResponse } from 'next/server';
import { getPollResults, getPollById } from '@/lib/db/polls';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PollResultsTemplate from '@/lib/export/PollResultsTemplate';
import puppeteer from 'puppeteer';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    const { poll, options } = await getPollById(pollId);
    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const chartType = (searchParams.get('chartType') as 'bar' | 'pie' | 'line') || 'bar'; 
    const format = searchParams.get('format') || 'json'; 
    const filterUserId = searchParams.get('filterUserId');
    const filterAnonymousUserId = searchParams.get('filterAnonymousUserId');

    const results = await getPollResults(pollId, filterUserId, filterAnonymousUserId);

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

    if (format === 'csv') {
      const csvHeader = 'Option,Votes,Percentage\n';
      const csvRows = numericalSummary.map(row => `${row.option},${row.votes},${row.percentage.toFixed(2)}`).join('\n');
      const csvContent = csvHeader + csvRows;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="poll_results_${pollId}.csv"`,
        },
      });
    }

    if (format === 'image' || format === 'pdf') {
      const templateHtml = ReactDOMServer.renderToString(
        <html>
          <head>
            <title>Poll Results for {poll.title}</title>
            {/* Add basic styling for charts and table */}
            <style>
              {`
                body { margin: 0; padding: 0; }
                h1, h2, p { margin-bottom: 10px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              `}
            </style>
          </head>
          <body>
            <PollResultsTemplate 
              poll={poll}
              options={options}
              results={results}
              chartData={chartData}
              numericalSummary={numericalSummary}
              chartType={chartType}
            />
            {isRealtime && <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '20px' }}>Results are real-time.</p>}
            {!isRealtime && <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '20px' }}>Results are a snapshot as of ${new Date().toLocaleDateString()}.</p>}
          </body>
        </html>
      );
      
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(templateHtml, { waitUntil: 'networkidle0' });

      if (format === 'image') {
        const imageBuffer = await page.screenshot({ type: 'png', fullPage: true });
        await browser.close();
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="poll_results_${pollId}.png"`,
          },
        });
      } else if (format === 'pdf') {
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="poll_results_${pollId}.pdf"`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, poll, options, results, chartData, numericalSummary, isRealtime });
  } catch (error) {
    console.error('Error exporting poll results:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
