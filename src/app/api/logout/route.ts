import { logout } from '@/app/login/actions';
import { NextResponse } from 'next/server';

export async function POST() {
    await logout();
    return NextResponse.redirect('/login');
}
