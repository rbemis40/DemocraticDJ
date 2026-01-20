import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg } from "../../_types/server_msg";
import { UIProps } from "../../types";

export default function PlayerSelectVoters(props: UIProps) {
    useServerMsg((msg: ServerMsg) => {

    }, ["voter_mode_state"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return <h1>Player Select Voters</h1>
}