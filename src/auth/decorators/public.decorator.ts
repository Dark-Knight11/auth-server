import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_ENDPOINT = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_ENDPOINT, true);