import { FastifyInstance } from "fastify";
import {
  CreateSpaceInput,
  DeleteSpaceInput,
  GetSpaceInput,
  // ListPublicSpacesInput,
  UpdateSpaceInput,
} from "./spaces.schema";
import { NotFoundError, ForbiddenError } from "../../utils/error";
import { generateInviteCodes } from "../../utils/helpers";
import { calculatePagination } from "../../utils/response";
import { CACHE_KEYS, CACHE_TTL } from "../../config/constants";
import { ConnectionManager } from "../../websocket/connection-manager";

export class SpaceService {
  constructor(private app: FastifyInstance) {}

  private async generateUniqueInviteCode() {
    while (true) {
      const code = generateInviteCodes(8, true);
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
    await this.app.redis.setex(
      CACHE_KEYS.SPACE(space.id),
      CACHE_TTL.LONG,
      JSON.stringify(space),
    );

    return space;
  }

  async getSpace(input: GetSpaceInput) {
    // fetch from cache
    const cached = await this.app.redis.get(CACHE_KEYS.SPACE(input.id));
    if (cached) {
      const space = JSON.parse(cached);
      return {
        ...space,
        memberCount: ConnectionManager.getInstance().getSpaceMemberCount(
          space.id,
        ),
        members: ConnectionManager.getInstance().getSpaceMembers(space.id),
      };
    }

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
    await this.app.redis.setex(
      CACHE_KEYS.SPACE(space.id),
      CACHE_TTL.LONG,
      JSON.stringify(space),
    );

    return {
      ...space,
      memberCount: ConnectionManager.getInstance().getSpaceMemberCount(
        space.id,
      ),
      members: ConnectionManager.getInstance().getSpaceMembers(space.id),
    };
  }

  async getSpaceByCode(inviteCode: string) {
    // Check if we have the mapping from code to ID in cache
    const cachedId = await this.app.redis.get(
      CACHE_KEYS.INVITE_CODE(inviteCode),
    );

    if (cachedId) {
      return this.getSpace({ id: cachedId });
    }

    // Lookup in DB
    const space = await this.app.prisma.space.findUnique({
      where: { inviteCode },
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
      throw new NotFoundError("Space not found with this invite code");
    }

    // Cache the mapping from code to ID
    await this.app.redis.setex(
      CACHE_KEYS.INVITE_CODE(inviteCode),
      CACHE_TTL.LONG,
      space.id,
    );

    // Also cache the space details (just in case they weren't in cache)
    await this.app.redis.setex(
      CACHE_KEYS.SPACE(space.id),
      CACHE_TTL.LONG,
      JSON.stringify(space),
    );

    return {
      ...space,
      memberCount: ConnectionManager.getInstance().getSpaceMemberCount(
        space.id,
      ),
      members: ConnectionManager.getInstance().getSpaceMembers(space.id),
    };
  }

  async listPublicSpaces({
    page = 1,
    limit = 20,
  }: {
    page: number;
    limit: number;
  }) {
    // const { page = 1, limit = 20 } = input;
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

    const spacesWithLiveCounts = spaces.map((s) => ({
      ...s,
      memberCount: ConnectionManager.getInstance().getSpaceMemberCount(s.id),
    }));

    return {
      spaces: spacesWithLiveCounts,
      meta: calculatePagination(page, limit, total),
    };
  }

  async listUserSpaces(
    userId: string,
    { page = 1, limit = 20 }: { page: number; limit: number },
  ) {
    const total = await this.app.prisma.space.count({
      where: { ownerId: userId },
    });

    const spaces = await this.app.prisma.space.findMany({
      where: { ownerId: userId },
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

    const spacesWithLiveCounts = spaces.map((s) => ({
      ...s,
      memberCount: ConnectionManager.getInstance().getSpaceMemberCount(s.id),
    }));

    return {
      spaces: spacesWithLiveCounts,
      meta: calculatePagination(page, limit, total),
    };
  }

  async updateSpace(input: UpdateSpaceInput, userId: string) {
    const { id, ...data } = input;
    const space = await this.app.prisma.space.findUnique({
      where: { id: input.id },
    });

    if (!space) {
      throw new NotFoundError("Space not found");
    }

    if (space.ownerId !== userId) {
      throw new ForbiddenError("Only space owner can update this space.");
    }

    const updated = await this.app.prisma.space.update({
      where: { id },
      data,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // invalidate cache
    await this.app.redis.del(CACHE_KEYS.SPACE(id));

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

    // invalidate cache
    await this.app.redis.del(CACHE_KEYS.SPACE(input.id));

    return { success: true };
  }
}
