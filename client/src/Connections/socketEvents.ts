export interface ServerToClientEvents {
    //Authentification
    login: (data: string) => void;
    anonymousLogin: (data: string) => void;
    register: (data: string) => void;

    //Rooms
    listRoom: (data: string) => void;
    joinRoom: (data: string) => void; // room joined successfully ou erreur
    leaveRoom: (data: string) => void; // [toto] has left the chat ou [toto] connection lost
    addRoom: (data: string) => void; // succès ou erreur

    //Messages
    history: (data: string) => void;
    msg: (data: string) => void;
    pm: (data: string) => void; // seulement le message à l'envoyeur et au receveur

    //Users
    addFriend: (data: string) => void; // demande d'ami : pour accepter /accept ?
    listUser: (data: string) => void;
    acceptFriend: (data: string) => void;

    //Misc
    ascii: (data: string) => void;
    rick: (data: string) => void;
}

export interface ClientToServerEvents {
    //Authentification
    login: (userData: string) => void; // username pour invité ou username + password pour personne enregistrée
    anonymousLogin: (userData: string) => void;
    register: (userData: string) => void;

    //Rooms
    listRoom: () => void;
    joinRoom: (roomName: string) => void;
    leaveRoom: (data: string) => void;
    addRoom: (roomName: string) => void;

    //Messages
    history: (data: string) => void; // 50 msg par défaut ? sinon nombre précisé
    msg: (data: string) => void;
    pm: (data: string) => void; // nom user + message

    //Users
    listUser: (roomName: string) => void;
    addFriend: (username: string) => void;
    acceptFriend: (data: string) => void;

    //Misc
    ascii: () => void;
    rick: () => void;
    exit: (roomName: string) => void;
}
