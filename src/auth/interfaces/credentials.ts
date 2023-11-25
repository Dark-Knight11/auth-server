import { Prisma } from "@prisma/client";

// TODO()
export class Credentials implements Prisma.InputJsonObject {
  readonly [x: string | number]: Prisma.InputJsonValue;
  version: number;
  lastPassword: string;
  passwordUpdatedAt: number;
  updatedAt: number;
}