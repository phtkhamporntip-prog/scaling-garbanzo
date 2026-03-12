import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { UserServices } from "./user.services";
import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import Pick from "../../../shared/pick";
import { paginationFields } from "../../../constant/pagination";

// getAllUsers Controller
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = Pick(req.query, ["name", "email", "role"])
  const options = Pick(req.query, paginationFields);
  const users = await UserServices.getAllUsers(filter, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    meta: users.meta,
    data: users.data,
  });
});

// getUserById Controller
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserServices.getUserById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

// Update User by id Controller
const updateUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const user = await UserServices.updateUserById(payload, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// delete User by id Controller
const deleteUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserServices.deleteUserById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: user,
  });
});

export const UserControllers = {
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
};
