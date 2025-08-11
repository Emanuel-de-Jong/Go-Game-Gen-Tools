var board = {};

board.HANDICAP_SGFS = {
    19: {
        2: "[pd][dp]",
        3: "[dd][pd][dp]",
        4: "[dd][pd][dp][pp]",
        5: "[dd][pd][jj][dp][pp]",
        6: "[dd][pd][dj][pj][dp][pp]",
        7: "[dd][pd][dj][jj][pj][dp][pp]",
        8: "[dd][jd][pd][dj][pj][dp][jp][pp]",
        9: "[dd][jd][pd][dj][jj][pj][dp][jp][pp]",
    },
    13: {
        2: "[jd][dj]",
        3: "[dd][jd][dj]",
        4: "[dd][jd][dj][jj]",
        5: "[dd][jd][gg][dj][jj]",
        6: "[dd][jd][dg][jg][dj][jj]",
        7: "[dd][jd][dg][gg][jg][dj][jj]",
        8: "[dd][gd][jd][dg][jg][dj][gj][jj]",
        9: "[dd][gd][jd][dg][gg][jg][dj][gj][jj]",
    },
    9: {
        2: "[gc][cg]",
        3: "[cc][gc][cg]",
        4: "[cc][gc][cg][gg]",
        5: "[cc][gc][ee][cg][gg]",
        6: "[cc][gc][ce][ge][cg][gg]",
        7: "[cc][gc][ce][ee][ge][cg][gg]",
        8: "[cc][ec][gc][ce][ge][cg][eg][gg]",
        9: "[cc][ec][gc][ce][ee][ge][cg][eg][gg]",
    },
};


board.init = function (serverBoardsize, serverHandicap, serverSGF) {
    board.handicapElement = document.getElementById("currentHandicap");

    board.placeStoneAudios = [
        new Audio("resources/placeStone0.mp3"),
        new Audio("resources/placeStone1.mp3"),
        new Audio("resources/placeStone2.mp3"),
        new Audio("resources/placeStone3.mp3"),
        new Audio("resources/placeStone4.mp3"),
    ];
    board.lastPlaceStoneAudioIndex = 0;

    // Disable mouse 3/4 triggering prev/next in browser
    document.addEventListener("mouseup", (e) => {
        if (typeof e === "object" && (e.button == 3 || e.button == 4)) {
            e.preventDefault();
        }
    });
    utils.addEventsListener(document, ["keydown", "mousedown"], board.keydownAndMousedownListener);

    board.clear(serverBoardsize, serverHandicap, serverSGF);
};

board.clear = function (serverBoardsize, serverHandicap, serverSGF) {
    board.boardsize = serverBoardsize ? serverBoardsize : settings.boardsize;
    board.setHandicap(serverHandicap != null ? serverHandicap : settings.handicap);

    board.element = document.getElementById("board");

    let besogoOptions = {
        resize: "auto",
        orient: "portrait",
        panels: "control+names+tree+comment+file",
        coord: "western",
        tool: "navOnly",
        size: board.boardsize,
        variants: 2,
        nowheel: true,
    };

    if (serverSGF) {
        besogoOptions.sgf = serverSGF;
    } else if (board.handicap != 0) {
        besogoOptions.sgf = "(;" +
            "SZ[" + board.boardsize + "]" +
            "HA[" + board.handicap + "]" +
            "AB" + board.HANDICAP_SGFS[board.boardsize][board.handicap] +
            ")";
    }

    if (debug.testData == 1) {
        besogoOptions.sgf =
            "(;GM[1]FF[4]CA[UTF-8]AP[Sabaki:0.52.0]KM[7.5]SZ[19]DT[2022-12-29](;B[pd];W[qc](;B[qd];W[pc];B[od])(;B[pc];W[qd](;B[pe];W[qe];B[qf];W[rf])(;B[qe];W[re])))(;B[dp]))";
    } else if (debug.testData == 2) {
        besogoOptions.sgf =
            "(;GM[1]FF[4]CA[UTF-8]AP[Sabaki:0.52.0]KM[6.5]SZ[19]DT[2022-11-09]PB[KataGo 1.11];B[pd];W[dp];B[pp]SBKV[47.95];W[dd]SBKV[48.06];B[fc]SBKV[47.97];W[qq]SBKV[48.22];B[pq];W[qp]SBKV[48.12];B[po]SBKV[48.08];W[rn]SBKV[48.27];B[cf]SBKV[48.05];W[ef]SBKV[48.53];B[ci]SBKV[47.88];W[nc]SBKV[48.18];B[cn];W[qf];B[pf];W[pg];B[of];W[qe];B[qd]SBKV[49.94];W[kc]SBKV[51.19];B[fp]SBKV[50.3];W[ec];B[fd];W[qm];B[oc];W[nd];B[pe];W[kp];B[ic];W[eb];B[kd];W[jc];B[jd];W[ld];B[le];W[lc];B[ib];W[ob];B[pb];W[jb];B[me];W[hp];B[bd];W[eo];B[ie];W[ce];B[be];W[df];B[cg];W[dm];B[eh];W[cc];B[bb];W[cb];B[fb];W[gf];B[ee];W[de];B[fg];W[ff];B[hg];W[ed];B[fe];W[gg];B[gh];W[hf];B[ig];W[pj];B[md]SBKV[99.5];W[mb]SBKV[99.88];B[mc]SBKV[99.56];W[bc]SBKV[99.73];B[ac]SBKV[99.5];W[ab]SBKV[99.74];B[aa]SBKV[99.58];W[nq]SBKV[99.85];B[pm];W[pl];B[qn];W[rm];B[qr];W[qo];B[or];W[pn];B[mq];W[lq];B[mp];W[om];B[qg];W[rg];B[qh];W[ph];B[rh];W[qi];B[re];W[ri];B[rf];W[if];B[jg];W[cm];B[ck];W[km];B[bm];W[bl];B[bo];W[cl];B[cq];W[cp];B[bp];W[dq];B[cr];W[dr];B[ds];W[en];B[er]SBKV[99.85];W[fq]SBKV[99.96];B[fk];W[gm];B[ij];W[fr];B[mr];W[lr];B[hl];W[hm];B[nh]SBKV[99.89];W[mi]SBKV[99.97];B[mh]SBKV[99.8];W[ja]SBKV[99.94];B[la]SBKV[99.88];W[gb]SBKV[99.97];B[gc]SBKV[99.85];W[hd]SBKV[99.97];B[id]SBKV[99.87];W[ki]SBKV[99.98];B[oi]SBKV[99.93];W[oj];B[ls];W[ks];B[ms];W[jr];B[ni];W[nj];B[li];W[mm];B[kj];W[rr];B[rs];W[am];B[bn];W[rq];B[lo]SBKV[99.89];W[ko]SBKV[99.99];B[il]SBKV[99.91];W[im]SBKV[99.99];B[dk]SBKV[99.87];W[pc]SBKV[99.99];B[qc]SBKV[99.92];W[bh]SBKV[99.97];B[ch]SBKV[99.93];W[aq]SBKV[99.99];B[bq]SBKV[99.93];W[cs]SBKV[99.98];B[bs]SBKV[99.94];W[ar]SBKV[99.98];B[an]SBKV[99.92];W[ap]SBKV[99.99];B[fm]SBKV[99.94];W[gl];B[em]SBKV[99.92];W[dn]SBKV[99.99];B[gk]SBKV[99.93];W[eq]SBKV[99.99];B[fn]SBKV[99.93];W[fo]SBKV[100];B[pi]SBKV[99.94];W[ak]SBKV[99.99];B[mj]SBKV[99.93];W[si]SBKV[99.99];B[nk]SBKV[99.92];W[gn]SBKV[99.99];B[qj];W[qk]SBKV[99.99];B[bj]SBKV[99.91];W[aj]SBKV[99.99];B[sh]SBKV[99.9];W[rj]SBKV[99.98];B[bk]SBKV[99.93];W[ai]SBKV[99.99];B[oo]SBKV[99.94];W[mk]SBKV[99.99];B[ml]SBKV[99.9];W[lk]SBKV[99.99];B[ll]SBKV[99.92];W[kk]SBKV[99.99];B[kl]SBKV[99.93];W[jk]SBKV[99.99];B[jl]SBKV[99.92];W[nl]SBKV[100];B[ik]SBKV[99.94];W[al]SBKV[99.98];B[ok]SBKV[99.89];W[ol]SBKV[99.98];B[jj]SBKV[99.88];W[pk]SBKV[99.98];B[es]SBKV[99.89];W[fs]SBKV[99.98];B[ln]SBKV[99.89];W[kn]SBKV[99.99];B[cs]SBKV[99.9];W[el];B[fl];W[dl];B[bg];W[lm];B[jm];W[jn];B[ek];W[nk];B[nn];W[lj];B[mn];W[mi];B[lh];W[sr];B[ag];W[ss];B[qs];W[gp];B[co];W[do];B[lp];W[on];B[nm];W[mj];B[as];W[bi];B[ah];W[])";
    } else if (debug.testData == 3) {
        besogoOptions.sgf =
            "(;FF[4]GM[1]SZ[19]KM[6.5]RU[Japanese];B[pd];W[cp];B[pp];W[dc];B[eq];W[dq];B[ep];W[cn];B[ip];W[nq];B[lq];W[pr];B[qq];W[qr];B[qm];W[mq];B[lp];W[lr];B[kr];W[ms];B[jq];W[nc];B[qf];W[pc];B[qc];W[pb];B[ce];W[cd];B[de];W[fc];B[ci];W[od];B[pe];W[kd];B[cl];W[pj];B[en];W[dj];B[di];W[dl];B[dm];W[el];B[cj];W[gm];B[fm];W[fl];B[gl];W[gk];B[hl];W[hk];B[il];W[ik];B[jl];W[em];B[fn];W[cm];B[ej];W[fk];B[oe];W[ne];B[nf];W[qh];B[rk];W[rj];B[qk];W[qj];B[me];W[nd];B[ck];W[dn];B[no];W[pk];B[om];W[pl];B[jk];W[pm];B[pn];W[ql];B[rm];W[rl];B[qo];W[rq];B[ml];W[mj];B[fe];W[hd];B[je];W[jd];B[he];W[ie];B[if];W[id];B[hf];W[ke];B[mf];W[kf];B[gi];W[ii];B[md];W[mc];B[qb];W[ld];B[gd];W[gc];B[jj];W[hi];B[gh];W[og];B[of];W[qg];B[mh];W[nh];B[lg];W[mi];B[rp];W[sq];B[sp];W[rs];B[er];W[dr];B[be];W[bd];B[pa];W[oa];B[qa];W[ob];B[ad];W[ac];B[ae];W[bb];B[ds];W[cs];B[es];W[br];B[dk];W[bl];B[bk];W[al];B[ng];W[oh];B[ak];W[bn];B[oq];W[or];B[op];W[mo];B[mp];W[np];B[mn];W[nn];B[lo];W[nm];B[nl];W[ol];B[on];W[lm];B[ll];W[lh];B[mg];W[ki];B[jf];W[kg];B[ed];W[ec];B[nk];W[nj];B[rg];W[rh];B[rf];W[hh];B[hg];W[jg];B[fd];W[sm];B[sn];W[sl];B[rn];W[kk];B[kl];W[kj];B[lk];W[lj];B[ji];W[jh];B[ig];W[fj];B[fi];W[ih];B[eh];W[eo];B[fo];W[do];B[ok];W[oj];B[sh];W[si];B[sg];W[dp];B[gp];W[pg];B[ks];W[rd];B[qd];W[rc];B[rb];W[sb];B[re];W[se];B[pf];W[le];B[lf];W[gj];B[ij];W[hj];B[dd];W[ls];B[mk];W[nr];B[ek];W[lb])";
    }

    besogo.create(board.element, besogoOptions);

    board.editor = board.element.besogoEditor;

    document.querySelector('#game button[title="Variants: [child]/sibling"]').remove();
    document.querySelector('#game button[title="Variants: show/[hide]"]').remove();
    document.querySelector('#game input[value="9x9"]').remove();
    document.querySelector('#game input[value="13x13"]').remove();
    document.querySelector('#game input[value="19x19"]').remove();
    document.querySelector('#game input[value="?x?"]').remove();
    document.querySelector('#game input[value="Comment"]').remove();
    document.querySelector('#game input[value="Edit Info"]').remove();
    document.querySelector('#game input[value="Info"]').remove();

    document
        .querySelector("#game .besogo-board")
        .insertAdjacentHTML(
            "beforeend",
            '<button type="button" class="btn btn-secondary" id="next" disabled>></button>'
        );
    board.nextButton = document.getElementById("next");

    board.commentElement = document.querySelector("#game .besogo-comment textarea");

    board.lastMove = board.editor.getCurrent();

    board.editor.addListener(gameplay.playerMarkupPlacedCheckListener);
    board.editor.addListener(gameplay.treeJumpedCheckListener);
    board.editor.addListener(sgf.boardEditorListener);
    board.nextButton.addEventListener("click", gameplay.nextButtonClickListener);
    G.phaseChangedEvent.add(board.phaseChangedListener);

    // console.log(besogo);
    // console.log(board.editor);
    // console.log(board.editor.getCurrent());
};


board.play = async function (suggestion, moveType = G.MOVE_TYPE.NONE, tool = "auto") {
    await board.draw(suggestion.coord, tool, true, moveType);
    scoreChart.update(suggestion);
    sgfComment.setComment(moveType);
};

board.draw = async function (coord, tool = "auto", sendToServer = true) {
    board.editor.setTool(tool);
    board.editor.click(coord.x, coord.y, false, false);
    board.editor.setTool("navOnly");

    if (tool == "auto" || tool == "playB" || tool == "playW") {
        if (G.phase == G.PHASE_TYPE.CORNERS || G.phase == G.PHASE_TYPE.PREMOVES || G.phase == G.PHASE_TYPE.GAMEPLAY) {
            board.playPlaceStoneAudio();
        }

        board.lastMove = board.editor.getCurrent();

        G.suggestionsHistory.add(G.suggestions);

        if (sendToServer) {
            if (tool == "auto") {
                await katago.play(coord);
            } else if (tool == "playB") {
                await katago.play(coord, G.COLOR_TYPE.B);
            } else if (tool == "playW") {
                await katago.play(coord, G.COLOR_TYPE.W);
            }
        }
    }
};

board.playPlaceStoneAudio = function () {
    let placeStoneAudioIndex;
    do {
        placeStoneAudioIndex = utils.randomInt(5);
    } while (placeStoneAudioIndex == board.lastPlaceStoneAudioIndex);
    board.lastPlaceStoneAudioIndex = placeStoneAudioIndex;

    board.placeStoneAudios[placeStoneAudioIndex].play();
};

board.syncWithServer = async function () {
    await katago.clearBoard();
    await katago.setHandicap();
    await katago.playRange();
};

board.getColor = function () {
    let currentMove = board.editor.getCurrent();
    if (currentMove.move) {
        return currentMove.move.color;
    }

    if (currentMove.moveNumber == 0) {
        return !board.handicap ? G.COLOR_TYPE.W : G.COLOR_TYPE.B;
    }

    return G.COLOR_TYPE.B;
};

board.getNextColor = function () {
    let currentMove = board.editor.getCurrent();
    if (currentMove.children && currentMove.children.length > 0) {
        return currentMove.children[0].move.color;
    }

    return board.getColor() * -1;
};

board.findStone = function (coord) {
    return board.editor.getCurrent().getStone(coord.x, coord.y);
};

board.pass = function () {
    board.editor.click(0, 0, false);
};

board.removeMarkup = function (coord) {
    let markup = board.editor.getCurrent().markup;
    markup[(coord.x - 1) * board.boardsize + (coord.y - 1)] = 0;
};

board.drawCoords = function (suggestionList) {
    let suggestions = suggestionList.getFilterByWeaker();

    let markup = board.editor.getCurrent().markup;
    for (let i = 0; i < markup.length; i++) {
        if (markup[i] && markup[i] != 4) {
            markup[i] = 0;
        }
    }

    board.editor.setTool("label");
    for (let i = 0; i < suggestions.length; i++) {
        let coord = suggestions[i].coord;

        board.editor.setLabel(suggestions[i].grade);
        board.editor.click(coord.x, coord.y, false, false);
    }

    board.editor.setTool("navOnly");
};

board.goToNode = function (nodeNumber) {
    let currentNodeNumber = board.getMoveNumber();
    let nodesToJump = nodeNumber - currentNodeNumber;
    if (nodesToJump > 0) {
        board.editor.nextNode(nodesToJump);
    } else if (nodesToJump < 0) {
        board.editor.prevNode(nodesToJump * -1);
    }
};

board.getMoveNumber = function () {
    return board.editor.getCurrent().moveNumber;
};

board.getNodeX = function () {
    return board.editor.getCurrent().navTreeX;
};

board.getNodeY = function () {
    return board.editor.getCurrent().navTreeY;
};

board.getNodeCoord = function () {
    return new Coord(board.getNodeX(), board.getNodeY());
};

board.getMoves = function () {
    let moves = [];
    let node = board.editor.getCurrent();
    while (node.moveNumber != 0) {
        moves.push({
            color: node.move.color,
            coord: new Coord(node.move.x, node.move.y),
        });

        node = node.parent;
    }

    moves = moves.reverse();
    return moves;
};

board.setHandicap = function (handicap) {
    board.handicap = handicap;
    board.handicapElement.innerHTML = handicap;
    if (G.phase != G.PHASE_TYPE.NONE && G.phase != G.PHASE_TYPE.INIT) sgf.setHandicapMeta();
};

board.keydownAndMousedownListener = function (event) {
    if (event.code == "Space" || event.code == "Enter" || event.button == 1 || event.button == 3 || event.button == 4) {
        board.nextButton.click();
    }
};

board.phaseChangedListener = function (e) {
    if (e.phase == G.PHASE_TYPE.GAMEPLAY || e.phase == G.PHASE_TYPE.FINISHED) {
        board.editor.setIsTreeJumpAllowed(true);
    } else {
        board.editor.setIsTreeJumpAllowed(false);
    }
};
