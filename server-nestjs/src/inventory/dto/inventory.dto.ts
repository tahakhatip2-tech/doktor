export class CreateInventoryDto {
  name: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock?: number;
  category?: string;
  supplier?: string;
  expiryDate?: Date;
}

export class UpdateInventoryDto {
  name?: string;
  barcode?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  stock?: number;
  category?: string;
  supplier?: string;
  expiryDate?: Date;
}
