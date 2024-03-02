import Loader from './@avery-loader/Loader';

// import createGlobalAnalytics from './components/GlobalAnalytics';

import NodeEmitter from './classes/NodeEmitter';
import { requestIdleCallbackPolyfill } from './utils/idlecallback-poly';
import { checkWebpSupport } from './utils/webp-support';
export default class Avery extends NodeEmitter {
	constructor({ detection, loader, analytics, preloader }) {
		super();

		this.runBasicConfig(detection);

		// if (analytics && analytics.firebase)
		// 	this.runAnalyticsConfigFirebase(analytics.firebase);

		if (loader) this.loader = new Loader(loader);

		console.log(detection, loader, analytics);
		// this.loader.preloader.createLoader(this.loader.template);

		// this.$on('afterEnter', this.loader.afterEnter.bind(this.loader));
	}

	runBasicConfig = async (detection) => {
		// detects device type and browser
		this.detection = detection;
		if (typeof this.detection === 'function') {
			await this.detection();
		}

		requestIdleCallbackPolyfill(); // window.requestIdleCallback (iOS)

		const isWebpSupported = await checkWebpSupport(); // checks webp support
		console.log(`Webp: ${isWebpSupported}`);
		window.isWebp = isWebpSupported;
	};

	// runAnalyticsConfigFirebase = ({ config }) => {
	// 	createGlobalAnalytics(config, Detection);
	// 	console.log(window.$ga);
	// };

	start() {
		// this.loader.preloader.on('completed', this.onPreloaded.bind(this));
		this.loader.start();
	}
}
