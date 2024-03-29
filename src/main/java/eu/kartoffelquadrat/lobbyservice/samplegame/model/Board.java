package eu.kartoffelquadrat.lobbyservice.samplegame.model;

import eu.kartoffelquadrat.asyncrestlib.BroadcastContent;

/**
 * Generic board interface with methods common to all board game implementations. The Board represents a snapshot state
 * of game with all information required by interacting clients. This excludes e.g. gameplay history snapshots or random
 * generator seed values.
 *
 * @Author: Maximilian Schiedermeier
 * @Date: December 2020
 */
public interface Board extends BroadcastContent {
}
