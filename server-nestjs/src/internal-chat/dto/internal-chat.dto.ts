import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    content: string;
}

export class CreateConversationDto {
    @IsNotEmpty()
    clinicId: number;
}
