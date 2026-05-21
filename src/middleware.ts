import { NextResponse } from 'next/server';

// TODO: khi cô yêu cầu phân quyền, thêm logic check JWT từ cookie ở đây:
// const token = request.cookies.get('admin_token')?.value;
// if (!token) return NextResponse.redirect(new URL('/login', request.url));
// const payload = await verifyJwt(token);
// if (payload.role !== 'admin') return NextResponse.redirect(new URL('/forbidden', request.url));
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
