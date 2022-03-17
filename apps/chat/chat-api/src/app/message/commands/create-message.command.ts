import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Message, Result } from "@oursocial/domain";
import { MessageDto, MessagePersistenceService } from "@oursocial/persistence";
import { dbMessageToMessage } from "../../common";
export class CreaterMessageCommand {
  constructor(public newMessage: MessageDto) { };
}
export type CreateMessageCommandResult = Result<Message | undefined>;
@CommandHandler(CreaterMessageCommand)
export class CreateMessageCommandHandler implements ICommandHandler<CreaterMessageCommand> {
  constructor(private messageService: MessagePersistenceService) { }
  async execute(command: CreaterMessageCommand): Promise<CreateMessageCommandResult> {
    try {
      const { newMessage } = command;
      const dbMessage = await this.messageService.create(newMessage);
      const result = await this.messageService.populateMessage(dbMessage);
      if (result.failed) throw result.error;
      const message = dbMessageToMessage(result.props!);
      return Result.success(message);
    } catch (e) {
      return Result.fail(e);
    }

  }

}