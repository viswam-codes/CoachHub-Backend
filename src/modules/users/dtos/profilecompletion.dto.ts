import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CompleteProfileDto {
  @IsNotEmpty()
  @IsString()
  goal: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  age: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  height: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  weight: number;

  @IsNotEmpty()
  @IsString()
  email: string; // Identify the user for profile updates
}
