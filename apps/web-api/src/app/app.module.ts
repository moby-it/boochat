import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from '@boochat/application';
import { PersistenceModule } from '@boochat/persistence';
import { ActiveUsersGateway } from './active-users';
import { AuthController } from './auth/auth.controller';
import { MessageGateway } from './message';
import { RoomsGateway } from './rooms';

const Gateways = [ActiveUsersGateway, MessageGateway, RoomsGateway];

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    ApplicationModule,
    PersistenceModule,
  ],
  providers: [...Gateways],
})
export class AppModule {}
