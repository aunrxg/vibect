import { FastifyReply } from "fastify";
import { AppError } from "./error";

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasPrev?: boolean;
    hasNext?: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
  statusCode: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  message?: string,
  statusCode = 200,
): FastifyReply {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
  };

  return reply.status(statusCode).send(response);
}

export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  meta: PaginationMeta,
  message?: string,
): FastifyReply {
  const response: SuccessResponse<T[]> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      page: meta.page,
      total: meta.total,
      limit: meta.limit,
      totalPages: meta.totalPages,
    },
  };

  return reply.status(200).send(response);
}

export function sendCreated<T>(
  reply: FastifyReply,
  data: T,
  message = "Resource created successfully",
  statusCode = HttpStatus.CREATED,
): FastifyReply {
  return sendSuccess(reply, data, message, statusCode);
}

export function sendError(reply: FastifyReply, err: AppError): FastifyReply {
  return reply.status(err.statusCode).send(err.toJson());
}

export function calculatePagination(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: totalPages > page,
    hasPrev: page > 1,
  };
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}
