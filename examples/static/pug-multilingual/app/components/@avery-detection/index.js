import SemverCompare from 'semver-compare';
import UAParser from 'ua-parser-js';

class DetectionManager {
	constructor() {
		this.parser = new UAParser();
		this.device = this.parser.getDevice();

		this.type = null;

		switch (this.device.type) {
			case 'mobile':
				this.type = 'phone';
				break;

			case 'tablet':
				this.type = 'tablet';
				break;

			default:
				this.type = 'desktop';
				break;
		}

		this.supported = {
			desktop: [
				{
					browser: 'chrome',
					minversion: 70,
				},
				{
					browser: 'firefox',
					minversion: 60,
				},
				{
					browser: 'safari',
					minversion: 11,
				},
				{
					browser: 'edge',
					minversion: 16,
				},
				{
					browser: 'opera',
					minversion: 58,
				},
			],
		};

		this.deviceStatus = {
			isMobile: this.checkMobile(),
			isPhone: this.checkPhone(),
			isTablet: this.checkTablet(),
			isDesktop: !this.isPhone && !this.isTablet,
		};

		this.browserStatus = {
			isEdge: this.checkEdge(),
			isFirefox: this.checkFirefox(),
			isIE: this.checkIE(),
			isSafari: this.checkSafari(),
		};

		// IS_DEVELOPMENT comes from webpack
		if (IS_DEVELOPMENT) {
			Object.keys(this.deviceStatus).forEach((key) => {
				if (this.deviceStatus[key]) {
					console.log(key);
				}
			});

			Object.keys(this.browserStatus).forEach((key) => {
				if (this.browserStatus[key]) {
					console.log(key);
				}
			});
		}

		if (
			typeof window.getComputedStyle(document.body).mixBlendMode === 'undefined'
		) {
			this.isMixBlendModeUnsupported = true;

			document.documentElement.className += ' mix-blend-mode-unsupported';
		}
	}

	compareVersions(a, b) {
		if (typeof a === 'string' || a instanceof String) {
			return SemverCompare(a, b) <= 0;
		}

		return a <= parseInt(b, 10);
	}

	isSupported() {
		let supported = false;

		if (this.checkAppBrowser()) {
			return true;
		}

		if (this.deviceStatus.isMobile) {
			return true;
		}

		this.supported[this.type].every((device) => {
			supported = Object.keys(device).every((requirement) => {
				let value = device[requirement];

				switch (requirement) {
					case 'os':
						return value === this.parser.getOS().name.toLowerCase();

					case 'minos':
						return this.compareVersions(value, this.parser.getOS().version);

					case 'browser':
						return value === this.parser.getBrowser().name.toLowerCase();

					case 'minversion':
						return this.compareVersions(
							value,
							this.parser.getBrowser().version
						);

					case 'versions':
						const v = isNaN(parseInt(this.parser.getBrowser().version, 10))
							? this.parser.getBrowser().version.toLocaleLowerCase()
							: parseInt(this.parser.getBrowser().version, 10);

						return value.indexOf(v) >= 0;

					default:
						return false;
				}
			});

			return !supported;
		});

		return supported;
	}

	checkAppBrowser() {
		const ua = navigator.userAgent || navigator.vendor || window.opera;

		if (
			ua.indexOf('FBAN') > -1 ||
			ua.indexOf('FBAV') > -1 ||
			ua.indexOf('Twitter') > -1
		) {
			return true;
		}

		return false;
	}

	checkEdge() {
		const browser = this.parser.getBrowser().name;

		const isEdge = browser === 'Edge';
		const isNotMobile = !this.deviceStatus.isMobile;

		return isEdge && isNotMobile;
	}

	checkFirefox() {
		const browser = this.parser.getBrowser().name;

		const isFirefox = browser === 'Firefox';
		const isNotMobile = !this.deviceStatus.isMobile;

		return isFirefox && isNotMobile;
	}

	checkIE() {
		const browser = this.parser.getBrowser().name;
		const ua = navigator.userAgent || navigator.vendor || window.opera;

		const isInternetExplorer = browser === 'IE';
		const isNotMobile = !this.deviceStatus.isMobile;
		const isNotMaxthon = ua.indexOf('Maxthon') === -1;

		return isInternetExplorer && isNotMobile && isNotMaxthon;
	}

	checkSafari() {
		const browser = this.parser.getBrowser().name;

		const isSafari = browser.indexOf('Safari') > -1;
		const isNotMobile = !this.deviceStatus.isMobile;

		return isSafari && isNotMobile;
	}

	checkMobile() {
		return this.checkPhone() || this.checkTablet();
	}

	checkPhone() {
		return this.type === 'phone';
	}

	checkTablet() {
		return this.type === 'tablet';
	}

	check({ onErrorBrowser, onErrorWebGL, onSuccess }) {
		// if (!this.isWebGLAvailable()) {
		//   onErrorWebGL();
		// } else
		if (this.isSupported()) {
			onSuccess();
		} else {
			onErrorBrowser();
		}
	}
}

export const Detection = new DetectionManager();
