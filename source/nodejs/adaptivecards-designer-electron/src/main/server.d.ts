export default class Sever {
    private readonly httpServer;
    private readonly instance;
    private readonly socketServer;
    readonly port: string;
    private readonly users;
    private sessions;
    constructor();
    startApp: () => Promise<{}>;
    private handleSocketConnection;
    private socketEventHandler;
    private addUser;
    private removeUser;
    private removeAllUsersFromSession;
    private createShareSession;
    private joinSession;
    private userJoin;
    private updateCard;
}
