import { z } from "zod";

const signupValidation = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(3)
      .max(255),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email(),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6)
      .max(20),
    role: z.enum(["user", "admin", "investor", "staker"], {
      required_error: "Role is required",
    }),
    contactNo: z.string({
      required_error: "Contact No is required",
    }),
    address: z.string({
      required_error: "Address is required",
    }),
    profileImg: z.string().optional(),
  }),
});

const loginValidation = z.object({
  body: z.object({
    email: z.string({
      required_error: "Email is required",
    }),
    password: z.string({
      required_error: "Password is required",
    }),
  }),
});

export const authValidation = {
  signupValidation,
  loginValidation,
};
