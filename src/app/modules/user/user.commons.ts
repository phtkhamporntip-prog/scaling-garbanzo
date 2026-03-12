export const UserSearchableFields= ["name", "email", "contactNo"];

export const UserFilterAbleFields= ["search","name", "email", "contactNo", "role", "address"];

export type TUserFilterAbleFields = {
  search?: string | undefined;
  role?: string | undefined;
  address?: string | undefined;
  email?: string | undefined;
  name?: string | undefined;
  contactNo?: string | undefined;
};
