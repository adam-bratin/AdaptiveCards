import * as express from "express";
import * as http from "http";
import { Server } from "http";
import * as shortId from "shortid";
import * as SocketIO from "socket.io";
import { Socket, Packet } from "socket.io";
import internalIp from "internal-ip";

interface IUser {
  socket: Socket;
  sessionId?: string;
}

interface ISession {
  sessionId: string;
  users: IUser[];
  cardData?: any;
  host: string;
}

type UserList = Record<string, IUser>;
type StreamSessionList = Record<string, ISession>;
export default class Sever {
  private readonly httpServer: Server;
  private readonly instance: express.Express;
  private readonly socketServer: SocketIO.Server;
  readonly port: string;
  private readonly users: UserList;
  private sessions: StreamSessionList;
  constructor() {
    this.instance = express();
    this.httpServer = http.createServer(this.instance);
    this.socketServer = SocketIO(this.httpServer);
    this.socketServer.use(this.handleSocketConnection);
    this.users = {};
    this.sessions = {};
    this.port = process.env.SERVER_PORT || "50000";
  }

  startApp = async () =>
    new Promise(resolve => {
      this.httpServer.listen(this.port, () => {
        console.log(`app started listening on port ${this.port}`);
        resolve();
      });
    });

  private handleSocketConnection = (
    socket: Socket,
    next: (err?: any) => void
  ) => {
    socket.use(this.socketEventHandler.bind(this, socket));
    next();
  };

  private socketEventHandler = (
    socket: Socket,
    packet: Packet,
    next: (err?: any) => void
  ) => {
    const [eventName, packetData] = packet;
    switch (eventName) {
      case "disconnect":
        this.removeUser(socket);
        break;
      case "add":
        this.addUser(socket);
        break;
      case "join":
        this.userJoin(socket, packetData);
        break;
      case "stream":
        this.createShareSession(socket);
        break;
      case "cardUpdate":
        this.updateCard(socket, packetData);
        break;
      default:
        next();
        break;
    }
  };

  private addUser = (socket: Socket) => {
    const user: IUser = { socket };
    this.users[socket.id] = user;
    socket.emit("User.added", socket.id);
  };

  private removeUser = (socket: Socket) => {
    const user: IUser = this.users[socket.id];
    if (user) {
      const socketId = user.socket.id;
      delete this.users[socketId];
      if (user.sessionId && user.sessionId in this.sessions) {
        const session: ISession = this.sessions[user.sessionId];
        const sessionUsers: IUser[] = session.users;
        session.users = sessionUsers.filter(
          user => user.socket.id !== socketId
        );

        const hostDisconnecting: boolean = session.host === socketId;
        if (hostDisconnecting) {
          socket
            .to(session.sessionId)
            .emit(
              "Host.disconnected",
              "host has disconnected will now close stream session"
            );
          this.removeAllUsersFromSession(session);
        }
        if (hostDisconnecting || Object.keys(sessionUsers).length === 0) {
          delete this.sessions[user.sessionId];
        }
      }
    }
  };

  private removeAllUsersFromSession = (session: ISession) => {
    const users: IUser[] = session.users;
    users.forEach(user => user.socket.disconnect(true));
  };

  private createShareSession = async (socket: Socket) => {
    const user: IUser = this.users[socket.id];
    if (user) {
      const sessionId: string = shortId.generate();
      const session: ISession = {
        sessionId,
        users: [],
        host: user.socket.id
      };
      this.sessions[sessionId] = session;
      const sessionJoined = await this.joinSession(socket, user, session);
      if (sessionJoined) {
        socket.emit(
          "Session.created",
          JSON.stringify(
            {
              sessionId,
              url: `http://${await internalIp.v4()}:${this.port}`
            },
            null,
            2
          )
        );
      } else {
        socket.emit(`Session.create.Error","unable to join session`);
      }
    } else {
      socket.emit(`Session.create.Error","unable to find user in userList`);
    }
  };

  private joinSession = (socket: Socket, user: IUser, session: ISession) => {
    return new Promise(resolve => {
      const sessionId = session.sessionId;
      socket.join(sessionId, (err?: any) => {
        if (!err) {
          user.sessionId = sessionId;
          session.users.push(user);
        }
        resolve(!err);
      });
    });
  };

  private userJoin = async (socket: Socket, packetData: any) => {
    const user: IUser = this.users[socket.id];
    const sessionId: string = packetData as string;
    if (user) {
      if (sessionId && sessionId in this.sessions) {
        const session: ISession = this.sessions[sessionId];
        const hasJoined = await this.joinSession(socket, user, session);
        if (hasJoined) {
          socket.emit("Session.join", sessionId);
          socket.emit("Card.updated", session.cardData);
        }
      } else {
        socket.emit(`Session.create.Error","not a valid sessionId`);
      }
    } else {
      socket.emit(`Session.create.Error","unable to find user in userList`);
    }
  };

  private updateCard = (socket: Socket, packetData: any) => {
    const user: IUser = this.users[socket.id];
    if (user) {
      const sessionId: string | undefined = user.sessionId;
      if (sessionId && sessionId in this.sessions) {
        const session = this.sessions[sessionId];
        session.cardData = packetData;
        socket.broadcast.to(sessionId).emit("Card.updated", packetData);
      } else {
        socket.emit(
          "Card.updateError",
          `unable to find session with id ${sessionId}`
        );
      }
    } else {
      socket.emit("Card.updateError", "unable to find user try resharing");
    }
  };
}
