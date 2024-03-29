function verifyGameExists() {

    fetch('/xox/api/games/' + getGameId())
        .then(result => result.json())
        .then(json => {
            if (json.error) // assumes that the server is nice enough to send an error message
                throw Error(json.error);
            else
                // ARL-long poll on "board"-resource that causes re-rendering whenever the board changed.
                observeResource('/xox/api/games/' + getGameId() + '/board?hash=', xoxBoardUpdate, markOffline, "");
        })
        .catch(error => {
            // Seems like the game does not exist:
            document.getElementById('xox-container').remove();
            alert('No such game: ' + getGameId());
        });
}

/**
 * Extracts the game-ID from the URL path.
 */
function getGameId() {
    return window.location.pathname.split('/')[4];
}

/**
 * Loads lobby location and assigns it to "Lobby button."
 */
function associateLobbyButton() {

    // get static server info bundle (contains lobby location)
    fetch('/xox')
        .then(result => result.json())
        .then(json => {
            let lobbyInternalLocation = json.associatedLobbyLocation;

            // Note: The lobbyLocation variable is the registered server-internal lobby location. It is not necessarily directly exposed to the client.
            // In an intermediate step we therefore extract port and baseurl of the lobby and attach it to the IP (or domain) location of the current site.
            let lobbyRelativeLocation = lobbyInternalLocation.split(':')[2];
            let lobbyAbsoluteLocation = "http:" + window.location.href.split(':')[1] + ":" + lobbyRelativeLocation + '/lobby.html';

            // forward to associated lobby location on button click.
            $('#lobby-button').click(function () {
                window.location.href = lobbyAbsoluteLocation;
            });
        })
        .catch(error => {
            // error handling here
            console.log(error);
        });
}

/**
 * Helper method to mark that connection to server is lost
 */
function markOffline() {
    alert('connection to server lost');
}

function xoxBoardUpdate(board) {
    // update board
    renderBoard(board);

    // retrieve updated set of actions, this internally also triggers status field updates (on success)
    associateActions();
}

function getGameStatusAndUpdateBar(actions) {
    // => access stats object: http://127.0.0.1:4244/xox/api/games/12345
    fetch('/xox/api/games/' + getGameId())
        .then(result => result.json())
        .then(json => {
            if (json.error) // assumes that the server is nice enough to send an error message
                throw Error(json.error);
            else {
                updateBar(json, actions);
            }

        })
        .catch(error => {
            // Seems like the game does not exist:
            alert('Error while getting stats: ' + error);
        });
}

/**
 * Called upon retrieval of gamestats by getGameStatusAndUpdateBar. The parameter is a json.
 *
 * @param gamestats sample structure: {"gameOver":false,"playersDescending":[{"name":"maex","preferredColour":"#CAFFEE"},{"name":"joerg","preferredColour":"#1C373A"}],"scoresDescending":[0,0]}
 */
function updateBar(gamestats, actions) {

    console.log("Game stats are: " + gamestats);
    let statusbar = document.getElementById('status-bar');

    // if the game is over, display the winner / draw
    if (gamestats.gameOver) {
        statusbar.innerHTML = '--- GAME OVER ---';
        // ToDo: display winner.
    }

    // if the game is still running, display who's turn it is (not your turn if actions object is empty)
    else {

        if (Object.keys(actions).length == 0)
            statusbar.innerHTML = 'It\'s ' + capitalizeFirstLetter(getOtherPlayerName(gamestats)) + '\'s turn.';
        else
            statusbar.innerHTML = 'It\'s your turn, ' + capitalizeFirstLetter(getUserName()) + '!';
    }
}

function getOtherPlayerName(gamestats) {
    if (gamestats.playersDescending[0].name === getUserName())
        return gamestats.playersDescending[1].name;
    return gamestats.playersDescending[0].name;
}

/**
 * Retrieves a map of actions. Keys are the MD5 values of their serialized string representation
 * Assigns the action-hashes to the corresponding cells.
 */
function associateActions() {

    // reset actions
    actions = {};

    // unregister all actions registered so far. (for clicks on all cells)
    $(".game-cell").each(function () {
        $(this).off();
    });

    // update local actions object, reassign handlers.
    fetch('/xox/api/games/' + getGameId() + '/players/' + getUserName() + '/actions?access_token=' + getAccessToken())
        .then(result => {
            if (result.ok) {
                result.json()
                    .then(json => {
                        if (json.error) // assumes that the server is nice enough to send an error message
                            throw Error(json.error);
                        else {
                            // associate new click handler to every referenced cell (entries in json that encodes action map)
                            $.each(json, function (actionhash, action) {
                                bindActionHashToCellClick(action.y, action.x, action.player.name, actionhash);
                            });

                            // also update status fields (json is actions object)
                            getGameStatusAndUpdateBar(json);
                        }
                    })
                    // server replied with a 200, but we are unable to parse json - probably obsolete.
                    .catch(error => {
                        alert('Error: ' + error.toString());
                    });
            } else
                // the server replied, but with a non 200 (so there is no json to parse, just text.)
                result.text().then(text => alert(text));
        })
        // something went horribly wrong, we can't even get an error code from the server. (Probably obsolete)
        .catch(error => {
            alert('Error: ' + error.toString());
        });
}

function bindActionHashToCellClick(x, y, player, hash) {
    // resolve action position to corresponding html element
    $('#' + x + y).click(function () {
        playAction(player, hash)
    });
}

/**
 * Sends a post request to the API to play a specific action
 * @param player as the player who plays the action
 * @param hash as the id of the action
 */
function playAction(player, hash) {

    // Send a post request to /xox/api/games/{gameid}/players/{player}/actions/{action}
    // Add access_token as request parameter to authenticate
    fetch('/xox/api/games/' + getGameId() + '/players/' + player + '/actions/' + hash + '?access_token=' + getAccessToken(), {
        method: 'post'
    })
        .then(reply => {
            if (reply.status == 401)
                alert('Token invalid. Logout required');
            //logout(); // ToDo: First try to renew token, call logout() if that failed.
            if (reply.status != 200)
                console.log("Failed to start session. Server replied: " + reply.status);
        });
}

/**
 * Iterates over received board information and draws the x/o symbol to the grid.
 * This function is called by the resource observer.
 */
function renderBoard(board) {
    console.log('Rendering board...');

    // for all cells, if content told by API is not whitespace: set corresponding class (x/o)
    if (/\S/.test(board.cells[0][0]))
        document.getElementById('00').classList.add(board.cells[0][0]);
    if (/\S/.test(board.cells[1][0]))
        document.getElementById('10').classList.add(board.cells[1][0]);
    if (/\S/.test(board.cells[2][0]))
        document.getElementById('20').classList.add(board.cells[2][0]);
    if (/\S/.test(board.cells[0][1]))
        document.getElementById('01').classList.add(board.cells[0][1]);
    if (/\S/.test(board.cells[1][1]))
        document.getElementById('11').classList.add(board.cells[1][1]);
    if (/\S/.test(board.cells[2][1]))
        document.getElementById('21').classList.add(board.cells[2][1]);
    if (/\S/.test(board.cells[0][2]))
        document.getElementById('02').classList.add(board.cells[0][2]);
    if (/\S/.test(board.cells[1][2]))
        document.getElementById('12').classList.add(board.cells[1][2]);
    if (/\S/.test(board.cells[2][2]))
        document.getElementById('22').classList.add(board.cells[2][2]);
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}