import { z } from 'zod';

declare const Tweet: z.ZodObject<{
    data: z.ZodObject<{
        author_id: z.ZodString;
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        author_id: string;
        id: string;
        text: string;
    }, {
        author_id: string;
        id: string;
        text: string;
    }>;
    includes: z.ZodObject<{
        users: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            username: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            username: string;
        }, {
            id: string;
            name: string;
            username: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        users: {
            id: string;
            name: string;
            username: string;
        }[];
    }, {
        users: {
            id: string;
            name: string;
            username: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        author_id: string;
        id: string;
        text: string;
    };
    includes: {
        users: {
            id: string;
            name: string;
            username: string;
        }[];
    };
}, {
    data: {
        author_id: string;
        id: string;
        text: string;
    };
    includes: {
        users: {
            id: string;
            name: string;
            username: string;
        }[];
    };
}>;
declare type Tweet = z.infer<typeof Tweet>;
declare const openTweetStream: (endpoint?: string) => ReadableStream<{
    data: {
        author_id: string;
        id: string;
        text: string;
    };
    includes: {
        users: {
            id: string;
            name: string;
            username: string;
        }[];
    };
}>;
declare const openEndlessTweetStream: (endpoint?: string) => ReadableStream<{
    data: {
        author_id: string;
        id: string;
        text: string;
    };
    includes: {
        users: {
            id: string;
            name: string;
            username: string;
        }[];
    };
}>;

export { Tweet, openEndlessTweetStream, openTweetStream };
