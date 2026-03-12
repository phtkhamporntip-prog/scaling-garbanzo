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
    contactNo: z.string({
      required_error: "Contact No is required",
    }),
    address: z.string({
      required_error: "Address is required",
    }),
    profileImg: z.string().optional(),
  }),
});

const bootstrapAdminValidation = z.object({
  body: z.object({
    secret: z.string({
      required_error: "Bootstrap secret is required",
    }),
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
      .min(8)
      .max(50),
    contactNo: z.string({
      required_error: "Contact No is required",
    }),
    address: z.string().optional(),
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

const oauthProviderValidation = z.object({
  params: z.object({
    provider: z.enum(["google", "github", "microsoft", "oidc"]),
  }),
});

const oauthCallbackValidation = z.object({
  params: z.object({
    provider: z.enum(["google", "github", "microsoft", "oidc"]),
  }),
  query: z.object({
    code: z.string({
      required_error: "OAuth authorization code is required",
    }),
    state: z.string({
      required_error: "OAuth state is required",
    }),
  }),
});

const refreshTokenValidation = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
  cookies: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

const logoutValidation = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
  cookies: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

export const authValidation = {
  signupValidation,
  bootstrapAdminValidation,
  loginValidation,
  oauthProviderValidation,
  oauthCallbackValidation,
  refreshTokenValidation,
  logoutValidation,
};
