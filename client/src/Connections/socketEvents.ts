export interface ServerToClientEvents {
    login: (data: string) => void;
    listRoom: (data: string) => void;
    joinRoom: (data: string) => void; // room joined successfully ou erreur
    history: (data: string) => void;
    msg: (data: string) => void;
    leaveRoom: (data: string) => void; // [toto] has left the chat ou [toto] connection lost
    addRoom: (data: string) => void; // succès ou erreur
    listUser: (data: string) => void;
    pm: (data: string) => void; // seulement le message à l'envoyeur et au receveur
    addFriend: (data: string) => void; // demande d'ami : pour accepter /accept ?
}

export interface ClientToServerEvents {
    handshake: (callback: (data: string) => void) => void;
    login: (userData: string) => void; // username pour invité ou username + password pour personne enregistrée
    listRoom: () => void;
    joinRoom: (roomName: string) => void;
    history: (count: number) => void; // 50 msg par défaut ? sinon nombre précisé
    msg: (data: string) => void;
    leaveRoom: () => void;
    addRoom: (roomName: string) => void;
    listUser: () => void;
    pm: (userName: string, message: string) => void; // nom user + message
    addFriend: (username: string) => void;
}