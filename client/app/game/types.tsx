export type SendFn = (msg: string) => void;
export interface UIProps {
    sendMsg: SendFn; // Function to send a msg to the game server
};