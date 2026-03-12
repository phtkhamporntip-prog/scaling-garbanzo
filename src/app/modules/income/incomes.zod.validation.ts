import { z } from "zod";

const postValidation = z.object({
  body: z.object({}),
});

const updateValidation = z.object({
  body: z.object({
    stakeIncome: z.number().optional(),
    referralIncome: z.number().optional(),
  }),
});

export const IncomesValidation = {
  postValidation,
  updateValidation,
};
