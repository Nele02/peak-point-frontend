export interface Session {
	name: string;
	_id: string;
	token: string;
}

export interface User {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	_id?: string;
}
