# paperclips-auto

This bit of javascript completes the game Universal Paperclips, unattended. It currently works, but the developers may release updates that will break this code. The javascript code is a rudimentary rules engine that relies on the presence of specific DOM elements and game mechanics. Simple mathematical calculations drive the strategy, which has much room for optimization. A 8px red indicator temporarily appears over the clicked control, so you can visualize what the code is doing. Console messages are emitted for most actions.

The offer will be rejected.

Monitor your game with [paperclips-reporter](https://github.com/marclitchfield/paperclips-reporter)

## Setup
Make a bookmark with this url:
```
javascript: (function() { var a = document.createElement("script"); a.src = "https://marclitchfield.github.io/paperclips-auto/paperclips-auto.js"; document.getElementsByTagName("head")[0].appendChild(a) })();
```
Then navigate to the game at http://www.decisionproblem.com/paperclips/index2.html, and select the bookmark. 

Alternatively, you can Copy & Paste the contents of `paperclips-auto.js` into your browser's console.

