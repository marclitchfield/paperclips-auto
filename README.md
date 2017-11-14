# Paperclips-Auto

This bit of javascript completes the game Universal Paperclips, unattended. It currently works, but the developers may release updates that will break this code. Copy & Paste the contents of `paperclips-auto.js` into your browser's console while at http://www.decisionproblem.com/paperclips/index2.html, and the program should beat the game from any point. 

The javascript code is a rudimentary rules engine that relies on the presence of specific DOM elements and game mechanics. Simple mathematical calculations drive the strategy, which has much room for optimization. A 4px red indicator temporarily appears over the clicked control, so you can what the code is doing. Console messages are emitted for some actions (those with a description not preceded by #).

The `ACCEPT_OFFER` constant at the top of the file controls whether The Drift's offer will be accepted or rejected at the end of the game.
