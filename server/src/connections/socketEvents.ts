export interface ServerToClientEvents {
    ascii: (data: string) => void; // ascii buffer
    anonymousLogin: (data: string) => void;
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
    ascii: () => void;
    handshake: (callback: (data: string) => void) => void;
    anonymousLogin: (userData: string) => void; // pour invité
    login: (userData: string) => void; // username + password pour personne enregistrée
    listRoom: () => void;
    joinRoom: (roomName: string) => void;
    history: (data: string) => void; // 50 msg par défaut ? sinon nombre précisé
    msg: (data: string) => void;
    leaveRoom: () => void;
    addRoom: (roomName: string) => void;
    listUser: () => void;
    pm: (data: string) => void; // nom user + message
    addFriend: (username: string) => void;
}
