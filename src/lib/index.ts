import { dev } from '$app/environment';
import { type Cookies } from '@sveltejs/kit';
import { type CookieSerializeOptions } from 'cookie';
import { nanoid } from 'nanoid';

export type SveltekitCookieSerializeOptions = CookieSerializeOptions & { path: string };

export const defaultCookieAttributes: SveltekitCookieSerializeOptions = {
	maxAge: 60 * 60 * 24 * 7,
	path: '/',
	sameSite: 'lax',
	secure: !dev
};

export class SessionKit {
	constructor(
		private store: <T>(sessionId: string) => Promise<T>,
		private cookieName: string = 'sessionkit',
		private cookieAttributes = defaultCookieAttributes,
		private nanoIdLength: number = 21
	) { }

	private getPattern(): RegExp {
		return new RegExp(`[a-zA-Z0-9-_]{${this.nanoIdLength}}`, 'i');
	}

	public async get<T>(cookies: Cookies): Promise<T> {

		let sessionId = cookies.get(this.cookieName);

		if (!sessionId || !this.getPattern().test(sessionId)) {
			sessionId = nanoid();
		}

		cookies.set(this.cookieName, sessionId, this.cookieAttributes);

		return await this.store<T>(sessionId) as T;
	}

}
