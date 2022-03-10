import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';
import { BaseDbEntity } from '../common/base.entity';
import { User } from "../users/user.schema";
export type RoomDocument = Room & Document;
@Schema()
export class Room extends BaseDbEntity {
    @Prop({ required: true })
    name: string;
    @Prop({ type: [Types.ObjectId], ref: 'User' })
    users: User[];
}
export const RoomsSchema = SchemaFactory.createForClass(Room);
