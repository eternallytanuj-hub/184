import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = (process.env.NEXT_PUBLIC_MODEL_API_URL || 'https://184model-production.up.railway.app').replace(/\/$/, '');

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const pathStr = params.path.join('/');
    const search = req.nextUrl.search;
    const targetUrl = `${BACKEND_BASE}/${pathStr}${search}`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to proxy request to ML model API', details: error?.message },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const pathStr = params.path.join('/');
    const body = await req.json();
    const targetUrl = `${BACKEND_BASE}/${pathStr}`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to proxy prediction to ML model API', details: error?.message },
      { status: 502 }
    );
  }
}
