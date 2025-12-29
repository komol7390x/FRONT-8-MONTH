export interface LoginT {
    username: string;
    password: string;
}

export interface LoginResponse {
    data: {
        token: string;
        user: {
            createdAt: string;
            fullName: string;
            id: string;
            role: string;
            updatedAt: string;
            username: string;
        };
    };
    message: string
}
