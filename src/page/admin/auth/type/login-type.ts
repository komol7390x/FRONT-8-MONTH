export interface LoginT {
    username: string;
    password: string;
}

export interface LoginResponse {
    data: {
        token: string;
        user: {
            id: string;
            role: string;
        };
    };
    message: string
}
