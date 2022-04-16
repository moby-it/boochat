export const findByUserIdQuery = (userId: string) => [
  {
    $match: {
      participantIds: userId
    }
  },
  {
    $lookup: {
      from: 'RoomItems',
      localField: '_id',
      foreignField: 'roomId',
      as: 'roomItems'
    }
  },
  {
    $project: {
      _id: 1,
      name: 1,
      lastItem: {
        $first: {
          $filter: {
            input: '$roomItems',
            cond: { $eq: ['$$this.createdAt', { $max: '$roomItems.createdAt' }] }
          }
        }
      },
      participantIds: 1,
      imageUrl: 1,
      lastVisits: 1
    }
  },
  {
    $project: {
      _id: 1,
      name: 1,
      lastItem: 1,
      participantIds: 1,
      imageUrl: 1,
      lastVisit: {
        $first: {
          $filter: {
            input: '$lastVisits',
            cond: { $eq: ['$$this.userId', userId] }
          }
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      name: 1,
      lastMessage: 1,
      participantIds: 1,
      imageUrl: 1,
      lastItem: 1,
      isUnread: {
        $cond: {
          if: '$lastVisit',
          then: { $lt: [{ $toDate: '$lastVisit.timestamp' }, '$lastItem.createdAt'] },
          else: true
        }
      }
    }
  }
];
