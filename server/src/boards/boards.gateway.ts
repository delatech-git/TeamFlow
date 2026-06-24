import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BoardsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join-board')
  handleJoinBoard(
    @MessageBody() boardId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} joined ${boardId}`);

    client.join(boardId);

    return {
      joined: boardId,
    };
  }
}
