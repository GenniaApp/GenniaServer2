import React from "react";
import Player from "./Player";
import { playerPropTypes } from "./types";
import { usePlayerState } from "@/hooks/index";

export default function PlayerState(props) {
  const { player, ...restProps } = props;
  const playerState = usePlayerState(player);

  return <Player {...restProps} {...playerState} />;
}

PlayerState.propTypes = {
  player: playerPropTypes.isRequired,
};
