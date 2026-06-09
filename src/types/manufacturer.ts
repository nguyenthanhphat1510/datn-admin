export interface ManufacturerLogo {
  url: string;
  publicId: string;
}

export interface Manufacturer {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: ManufacturerLogo | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateManufacturerDto {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateManufacturerDto = Partial<CreateManufacturerDto>;
