import { Expose } from 'class-transformer';
import { PollId, UserId, ValueObject } from '../../common';

interface PollVoteProps {
  userId: UserId;
  choiceIndex: number;
  pollId: PollId;
}
export class PollVote extends ValueObject<PollVoteProps> {
  constructor(props: PollVoteProps) {
    super(props);
  }
  @Expose()
  get userId() {
    return this._props.userId;
  }
  @Expose()
  get choiceIndex() {
    return this._props.choiceIndex;
  }
  @Expose()
  get pollId() {
    return this._props.pollId;
  }
}
