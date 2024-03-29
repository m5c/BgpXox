package eu.kartoffelquadrat.lobbyservice.samplegame.controller.xoxlogic;

import eu.kartoffelquadrat.lobbyservice.samplegame.controller.Action;
import eu.kartoffelquadrat.lobbyservice.samplegame.controller.LogicException;
import eu.kartoffelquadrat.lobbyservice.samplegame.model.PlayerReadOnly;

/**
 * Represents the only kind of blackboard action required in Xox. The Claim-Field action encodes a position, specified
 * through x and y coordinates and a player who claims the field. The origin is top-left, index counting starts at 0.
 *
 * @Author: Maximilian Schiedermeier
 * @Date: December 2020
 */
public class XoxClaimFieldAction implements Action {

    private final int x;
    private final int y;
    private final PlayerReadOnly player;

    /**
     * Constructor for a Xox action encoding the action that represents marking a specific cell (specified by x/y
     * coordinates.)
     *
     * @param x as the column-index to be populated by this action
     * @param y as the row-index to be populated by this action
     */
    public XoxClaimFieldAction(int x, int y, PlayerReadOnly player) throws LogicException {
        if (x < 0 || x > 2)
            throw new LogicException("Xox action can not be created. X position is out of bounds.");
        if (y < 0 || y > 2)
            throw new LogicException("Xox action can not be created. Y Position is out of bounds.");

        this.x = x;
        this.y = y;
        this.player = player;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public PlayerReadOnly getPlayer() {
        return player;
    }

    @Override
    public boolean equals(Object other)
    {
        if(other == null || other.getClass() != XoxClaimFieldAction.class)
            return false;

        // Compare position and name fields
        XoxClaimFieldAction otherAction = (XoxClaimFieldAction) other;
        if(getX() != otherAction.getX())
            return false;

        if(getY() != otherAction.getY())
            return false;

        return player.equals(otherAction.getPlayer());
    }
}
