import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg } from "../../_types/server_msg";
import { UIProps } from "../../types";

export default function HostSelectVoters(props: UIProps) {
    useServerMsg((msg: ServerMsg) => {
        console.log(msg);
    }, ["voter_mode_state"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return <h1>Host Select Voters</h1>
}