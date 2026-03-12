import { z } from "zod";

const postValidation = z.object({
  body: z.object({
    userId: z.string({
      required_error: "User id is required",
    }),
    referredBy: z.string({
      required_error: "Referral User id is required",
    }),
    referralDeposit: z.number({
      required_error: "Referral Deposit is required",
    }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    userId: z.string().optional(),
    referralId: z.string().optional(),
    referralDeposit: z.number().optional(),
  }),
});

export const ReferralsValidation = {
    postValidation,
    updateValidation
}
