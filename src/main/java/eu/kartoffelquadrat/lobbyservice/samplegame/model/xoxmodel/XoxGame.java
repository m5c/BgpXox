package eu.kartoffelquadrat.lobbyservice.samplegame.model.xoxmodel;

import eu.kartoffelquadrat.lobbyservice.samplegame.controller.communcationbeans.Player;
import eu.kartoffelquadrat.lobbyservice.samplegame.model.Game;
import eu.kartoffelquadrat.lobbyservice.samplegame.model.ModelAccessException;
import eu.kartoffelquadrat.lobbyservice.samplegame.model.PlayerReadOnly;

/**
 * Represents the state of a Xox running game.
 *
 * @Author: Maximilian Schiedermeier
 * @Date: December 2020
 */
public class XoxGame implements Game {

    // Read only access to the parameters of the two involved players.
    private final PlayerReadOnly[] players = new PlayerReadOnly[2];

    // Reference to current state of the board
    XoxBoard board;

    // Internal flag to indicate whether the game has already ended or still running.
    private boolean finished;

    // Internal index counter for the current player. Range: [0-1]
    private int currentPlayer;

    public XoxGame(Player startPlayer, Player secondPlayer) {
        players[0] = startPlayer;
        players[1] = secondPlayer;
        currentPlayer = 0;
        //Todo: Implement.
    }

    public boolean isFinished() {
        return finished;
    }

    public void markAsFinished() {
        finished = true;
    }

    @Override
    public PlayerReadOnly getPlayerByName(String name) {
        for (PlayerReadOnly player : players) {
            if (player.getName().equals(name))
                return player;
        }
        throw new ModelAccessException("Player object resolving requested, but the provided name is not associated to" +
                " the game.");
    }

    @Override
    public XoxBoard getBoard() {
        return board;
    }

    public PlayerReadOnly getPlayerInfo(int index) {

        return players[index];
    }

    public int getCurrentPlayerIndex() {
        return currentPlayer;
    }

    public String getCurrentPlayerName() {
        return players[currentPlayer].getName();
    }

    public void setCurrentPlayer(int nextCurrentPlayer) {
        if (nextCurrentPlayer != 0 && nextCurrentPlayer != 1)
            throw new ModelAccessException("Current player can not be set to a value other than 0 or 1.");
        currentPlayer = nextCurrentPlayer;
    }
}