interface UIProps {
    userList: string[];
    sendMsg: (msg: string) => void; // Function to send a msg to the game server
};

interface HostProps extends UIProps {
    gameId: number;
};