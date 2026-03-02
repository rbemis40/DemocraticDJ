import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg } from "../../_types/server_msg";
import { UIProps } from "../../types";

import styles from "./HostSelectVoters.module.css";

export default function HostSelectVoters(props: UIProps) {
    useServerMsg((msg: ServerMsg) => {
        console.log(msg);
    }, ["voter_mode_state"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return (
        <div className={styles.container}>
            <h1>Host Select Voters</h1>
        </div>
    );
}