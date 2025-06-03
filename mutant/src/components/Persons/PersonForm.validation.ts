import * as z from 'zod';

export const personFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  // Ensure group_id is treated as a number, coercing if necessary (e.g., from a select input)
  // and that a group is selected.
  group_id: z.number({ coerce: true, invalid_type_error: "Group ID must be a number" })
             .min(1, { message: "Group selection is required" }),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;