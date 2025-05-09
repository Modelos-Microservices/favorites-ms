import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
 
  @IsString({ message: 'User ID must be a string' })
  @IsUUID(4, { message: 'User ID must be a valid UUID' }) 
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  user_id: string;


  @IsInt({ message: 'Product ID must be an integer' })
  @IsNotEmpty({ message: 'Product ID cannot be empty' })
  product_id: number;

}