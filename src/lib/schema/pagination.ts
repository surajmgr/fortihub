import z, { ZodType } from 'zod';

export const cursorPaginationSchema = z.object({
	next: z.object({
		cursor: z.string().optional(),
		more: z.boolean()
	}),
	prev: z.object({
		cursor: z.string().optional(),
		more: z.boolean()
	}),
	totalItems: z.number().optional()
});
export type CursorPaginationSchema = z.infer<typeof cursorPaginationSchema>;

export const standardResponseSchema = <O extends ZodType>(outputSchema?: O, isPaginated = false) =>
	z.object({
		success: z.boolean(),
		message: z.string(),
		data: isPaginated
			? z.object({
					result: outputSchema ? outputSchema.array() : z.any().array(),
					pagination: cursorPaginationSchema
				})
			: (outputSchema ?? z.any())
	});
export type StandardResponseSchema = z.infer<typeof standardResponseSchema>;

export type CursorPaginatedResponse<T> = {
	success: boolean;
	message?: string;
	data: {
		result: T[];
		pagination: CursorPaginationSchema;
	};
};
