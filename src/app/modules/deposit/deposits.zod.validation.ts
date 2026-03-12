import { z } from "zod";

const postValidation = z.object({
    body: z.object({
        userId: z.string({
            required_error: "User id is required"
        }),
        amount: z.number({
            required_error: "Amount is required"
        })
    })
});

export const DepositsValidation = {
    postValidation
}
