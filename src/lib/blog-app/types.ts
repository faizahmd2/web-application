export interface User {
    userId: string;
    username: string;
    passwordHash: string;
    createdAt: string;
}

export interface CookieUser {
    userId: string;
    username: string;
}

export interface Post {
    postId?: string;
    title: string;
    content: string;
    authorId: string | null;
    isPublished: boolean;
    category?: string;
    createdAt: string;
    updatedAt: string;
}