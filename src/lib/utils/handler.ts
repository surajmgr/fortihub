import { standardResponseSchema, type CursorPaginationSchema } from '$lib/schema/pagination';
import z, { ZodType } from 'zod';
import { PUBLIC_AUTH_URL } from './publicConstants';
import { getErrorMessage } from './error';

export function asyncHandlerClient<TArgs extends readonly unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    name?: string
): (...args: TArgs) => Promise<TResult> {
    return async (...args: TArgs): Promise<TResult> => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error in ${name || 'function'}:`, error);
            throw error;
        }
    };
}

interface ApiHandlerOptions<
    I extends ZodType,
    O extends ZodType,
    W extends 'standard' | 'non-standard' = 'non-standard',
    Paginated extends boolean = false
> {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    input?: I;
    output?: O;
    wrapper?: W;
    isPaginated?: Paginated;
    transform?: (data: z.infer<O>) => z.infer<O>;
    auth?: boolean;
    baseUrl?: string;
}

interface ApiCallParams<I extends ZodType> {
    input?: z.infer<I>;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean>;
}

export function createApiHandler<
    I extends ZodType,
    O extends ZodType,
    W extends 'standard' | 'non-standard' = 'standard',
    Paginated extends boolean = false
>(options: ApiHandlerOptions<I, O, W, Paginated>) {
    type RawOutput = z.infer<O>;

    type DataPart = Paginated extends true
        ? { result: RawOutput[]; pagination: CursorPaginationSchema }
        : RawOutput;

    type StandardResponse<T> = {
        success: boolean;
        message?: string;
        data: T;
    };

    type Output = W extends 'standard' ? StandardResponse<DataPart> : DataPart;

    return async ({ input, query, headers: headersInput }: ApiCallParams<I>): Promise<Output> => {
        const {
            method,
            path,
            input: inputSchema,
            output: outputSchema,
            wrapper = 'standard' as W,
            isPaginated = false as Paginated,
            transform,
            auth,
            baseUrl
        } = options;

        const API_BASE = baseUrl ?? PUBLIC_AUTH_URL ?? '';

        // Validate input
        if (inputSchema && input) {
            const parsed = inputSchema.safeParse(input);
            if (!parsed.success) throw new Error('Invalid input: ' + parsed.error.message);
        }

        const url = new URL(path.startsWith('/') ? `${API_BASE}${path}` : path);
        if (query) {
            Object.entries(query).forEach(([key, val]) => url.searchParams.append(key, String(val)));
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headersInput
        };

        const res = await fetch(url.toString(), {
            method,
            headers,
            credentials: auth ? 'include' : 'same-origin',
            body: method !== 'GET' ? JSON.stringify(input ?? {}) : undefined
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(getErrorMessage(error, "Something went wrong"));
        }

        const json = await res.json();
        let validatedData: Output;

        if (wrapper === 'standard') {
            const stdSchema = standardResponseSchema(outputSchema, isPaginated);
            const parsed = stdSchema.safeParse(json);
            if (!parsed.success) throw new Error(parsed.error.message);

            validatedData = parsed.data as Output;
        } else {
            if (outputSchema) {
                const parsed = outputSchema.safeParse(json);
                if (!parsed.success) throw new Error('Invalid server response: ' + parsed.error.message);
                validatedData = parsed.data as Output;
            } else {
                validatedData = json as Output;
            }
        }

        if (transform) {
            if (
                isPaginated &&
                typeof validatedData === 'object' &&
                validatedData !== null &&
                'result' in validatedData
            ) {
                const paginatedData = validatedData as Output & { result: RawOutput[] };
                validatedData = {
                    ...paginatedData,
                    result: transform(paginatedData.result as unknown as RawOutput) as RawOutput[]
                } as Output;
            } else {
                validatedData = transform(validatedData as unknown as RawOutput) as Output;
            }
        }
        return validatedData;
    };
}
