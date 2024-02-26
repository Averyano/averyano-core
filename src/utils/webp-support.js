export const checkWebpSupport = async () => {
	return new Promise((resolve) => {
		if (!IS_WEBP) return resolve(false);

		const webp = new Image();
		webp.onload = webp.onerror = function () {
			resolve(webp.height === 1);
		};
		webp.src =
			'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
	});
};
