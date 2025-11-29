import { FastifyInstance } from "fastify";
import {
  CreateSpaceInput,
  DeleteSpaceInput,
  GetSpaceInput,
  ListPublicSpacesInput,
  UpdateSpaceInput,
} from "./spaces.schema";
import { ForbiddenError, NotFoundError } from "../../utils/error";
import { generateInviteCodes } from "../../utils/helpers";
import { calculatePagination } from "../../utils/response";

export class SpaceService {
  constructor(private app: FastifyInstance) {}

  private async generateUniqueInviteCode() {
    while (true) {
      const code = generateInviteCodes(8);
      const exists = await this.app.prisma.space.findUnique({
        where: { inviteCode: code },
      });
      if (!exists) return code;
    }
  }

  async createSpace(input: CreateSpaceInput, userId: string) {
    const inviteCode = await this.generateUniqueInviteCode();

    const space = await this.app.prisma.space.create({
      data: {
        ...input,
        ownerId: userId,
        inviteCode,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // create space membership

    // cache result

    return space;
  }

  async getSpace(input: GetSpaceInput) {
    // fetch from cache

    // from db
    const space = await this.app.prisma.space.findUnique({
      where: { id: input.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { songs: true, memberships: true },
        },
      },
    });

    if (!space) {
      throw new NotFoundError("Space not found");
    }

    // cache result

    return space;
  }

  async listPublicSpaces(input: ListPublicSpacesInput) {
    const { page, limit } = input;
    const total = await this.app.prisma.space.count({
      where: { isPublic: true },
    });

    const spaces = await this.app.prisma.space.findMany({
      where: { isPublic: true },
      skip: (page - 1) * limit,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { songs: true, memberships: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { spaces, meta: calculatePagination(page, limit, total) };
  }

  async updateSpace(input: UpdateSpaceInput, userId: string) {
    const { id, ...data } = input;
    const space = await this.app.prisma.space.findUnique({
      where: { id: id },
    });

    if (!space) {
      throw new NotFoundError("Space not found");
    }

    if (space.ownerId !== userId) {
      throw new ForbiddenError("Only space owner can update this space.");
    }

    const updated = await this.app.prisma.space.update({
      where: { id: id },
      data,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // update cache

    return updated;
  }

  async deleteSpace(input: DeleteSpaceInput, userId: string) {
    // verify authorization
    const space = await this.app.prisma.space.findUnique({
      where: { id: input.id },
    });

    if (!space) {
      throw new NotFoundError("This Space does not exist");
    }

    if (space.ownerId !== userId) {
      throw new ForbiddenError("Only Space Owners can delete space.");
    }

    await this.app.prisma.space.delete({
      where: { id: input.id },
    });

    // update cache

    return { success: true };
  }
}
