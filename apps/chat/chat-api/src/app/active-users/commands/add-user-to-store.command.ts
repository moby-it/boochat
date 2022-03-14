import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Result, UserId } from "@oursocial/domain";
import { UserPersistenceService, ActiveUsersStore } from "@oursocial/persistence";
import { Socket } from "socket.io";

export class AddUserToStoreCommand {
  constructor(public readonly googleId: string, public readonly socket: Socket) {

  }
}
export type AddUserToStoreCommandResult = Result<{ userId: UserId; } | undefined>;
@CommandHandler(AddUserToStoreCommand)
export class AddUserToStoreCommandHandler implements ICommandHandler<AddUserToStoreCommand>{
  constructor(private usersService: UserPersistenceService, private activeUsersStore: ActiveUsersStore) { }
  async execute({ googleId, socket }: AddUserToStoreCommand): Promise<AddUserToStoreCommandResult> {
    const result = await this.usersService.findOneByGoogleId(googleId);
    if (result.failed || !result.props) return Result.fail(`There is no user for googleId:${googleId}`);
    const userId = result.props.id;
    this.activeUsersStore.addUser(userId, socket.id);
    return Result.success({ userId });
  }

}
