export const requestIdleCallbackPolyfill = () => {
	// Fallback for browsers that don't support requestIdleCallback
	window.requestIdleCallback =
		window.requestIdleCallback ||
		function (callback, options) {
			var start = Date.now();
			return setTimeout(function () {
				callback({
					didTimeout: false,
					timeRemaining: function () {
						return Math.max(0, 50 - (Date.now() - start));
					},
				});
			}, 1);
		};

	window.cancelIdleCallback =
		window.cancelIdleCallback ||
		function (id) {
			clearTimeout(id);
		};
};
