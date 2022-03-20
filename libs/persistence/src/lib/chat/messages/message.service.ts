import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Guard, Result } from '@oursocial/domain';
import { Model, Types } from 'mongoose';
import { User } from '../../users';
import { DbRoom } from '../rooms/room.schema';
import { CreateMessageDto, MessageDto, PopulatedMessageDto } from './message.dto';
import { populatedMessageToMessageDto } from './message.functions';
import { DbMessage, PopulatedDbMessage } from './message.schema';

@Injectable()
export class MessagePersistenceService {
  constructor(@InjectModel(DbMessage.name) private messageModel: Model<DbMessage>) { }
  private readonly populateUserOptions = { path: 'sender', model: User.name };
  private readonly populateRoomOptions = { path: 'room', model: DbRoom.name };
  async create(messageDto: CreateMessageDto): Promise<MessageDto> {
    const { content, senderId, roomId } = messageDto;
    Guard.AgainstNullOrUndefined([{ propName: 'senderId', value: senderId }]);
    Guard.AgainstNullOrUndefined([{ propName: 'roomId', value: roomId }]);
    const createdMessage = new this.messageModel(
      {
        _id: new Types.ObjectId(),
        sender: new Types.ObjectId(senderId),
        content,
        room: new Types.ObjectId(roomId)
      });
    await createdMessage.save();
    return {
      content: createdMessage.content,
      createdAt: createdMessage.createdAt,
      roomId: createdMessage.room.toString(),
      senderId: createdMessage.sender.toString(),
      id: createdMessage._id.toString()
    };
  }
  async populateMessage(message: MessageDto): Promise<Result<PopulatedMessageDto | undefined>> {
    try {
      const dbMessage = await this.messageModel.findOne({ _id: new Types.ObjectId(message.id) });
      if (dbMessage) {
        const populatedMessage = await dbMessage.populate<PopulatedDbMessage>([this.populateRoomOptions, this.populateUserOptions]);
        return Result.success(populatedMessageToMessageDto(populatedMessage));
      }
      return Result.fail('no message found');
    } catch (e) {
      return Result.fail(e);
    }


  }
  async findByRoomId(roomId: string): Promise<MessageDto[]> {
    return await this.messageModel.find({ room: new Types.ObjectId(roomId) });
  }
  async findAll(): Promise<DbMessage[]> {
    return this.messageModel.find().exec();
  }
}