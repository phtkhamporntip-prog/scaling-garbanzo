import httpStatus from "http-status";
import ApiError from "../../../error/apiError";
import prisma from "../../../shared/prisma";
import { Prisma, Role, User } from "@prisma/client";
import { TUserFilterAbleFields, UserSearchableFields } from "./user.commons";
import { IPaginationOptions } from "../../../common/pagination";
import { paginationHelpers } from "../../../utils/paginationHelper";

// getAllUsers Service
const getAllUsers = async (
  filter: TUserFilterAbleFields,
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { search, ...filterData } = filter;
  // prisma query to get all users by searching and filtering
  const andQuery = [];
  if (search) {
    andQuery.push({
      OR: UserSearchableFields.map((field) => ({
        [field]: {
          contains: search,
          mode: "insensitive",
        },
      })),
    });
  }

  if (filterData.role) {
    andQuery.push({
      role: filterData.role as Role,
    });
    if (filterData.address) {
      andQuery.push({
        address: filterData.address,
      });
      if (filterData.email) {
        andQuery.push({
          email: filterData.email,
        });
      }
      if (filterData.name) {
        andQuery.push({
          name: filterData.name,
        });
      }
      if (filterData.contactNo) {
        andQuery.push({
          contactNo: filterData.contactNo,
        });
      }
    }
  }
  const whereConditions: any = andQuery.length > 0 ? { AND: andQuery } : {};
  const users = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      deposits: true,
      incomes: true,
      referredBy: true,
      referredTo: true,
      referralIncomes: true,
      withdraws: true,
      stakeRewards: true,
    },
  });

  const total = await prisma.user.count({ where: whereConditions });
  if (users.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found");
  }

  return {
    meta: {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

// getUserById Service
const getUserById = async (payload: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload,
    },
    include: {
      deposits: true,
      referredBy: true,
      referredTo: true,
      referralIncomes: true,
      withdraws: true,
    },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

// Update User by id Service
const updateUserById = async (
  payload: Prisma.UserUpdateInput,
  id: string
): Promise<User> => {
  const user = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

// Delete User by id Service
const deleteUserById = async (id: string): Promise<User> => {
  const isExistUser  = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!isExistUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found to delete");
  }
  const user = await prisma.user.delete({
    where: {
      id: id,
    },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
