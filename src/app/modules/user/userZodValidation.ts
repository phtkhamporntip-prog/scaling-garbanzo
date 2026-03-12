import { z } from "zod";

const updateValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    role: z.enum(["user", "admin", "investor", "staker"]).optional(),
    contactNo: z.string().optional(),
    address: z.string().optional(),
    profileImg: z.string().optional(),
  }),
});

export const userValidation = {
  updateValidation,
};
