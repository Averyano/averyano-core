import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics';
import { getCookie, setCookie } from '../utils/cookie';

const createGlobalAnalytics = (firebaseConfig) => {
	/* 🟢 🟢 🟢 🟢 🟢 */
	class GlobalAnalytics {
		constructor() {
			this.config = firebaseConfig;

			this.analyticsCookie = null;
			this.essentialCookie = null;
		}

		initAnalytics(adsPersonalization = 'false') {
			const app = initializeApp(this.config);
			this.analytics = getAnalytics(app);
			setUserProperties(this.analytics, { non_personalized_ads: false });
			// this.analytics.setAnalyticsCollectionEnabled(true);
			// this.analytics.setUserProperty(
			// 	ALLOW_AD_PERSONALIZATION_SIGNALS,
			// 	adsPersonalization
			// );
		}

		trackEvent(action, parameters = {}, cookieDuration = false) {
			if (!this.analyticsCookie) return;

			// If event should be recorded only once
			if (cookieDuration) {
				const eventCookie = getCookie(
					`event_${parameters.label ? parameters.label : action}`
				);

				// If event cookie exists, it means event was already recorded, so we return
				if (eventCookie) {
					return;
				}

				// If event cookie doesn't exist, we set it after recording the event
				setCookie(`event_${action}`, 'recorded', cookieDuration); // Set to expire in 1 day
			}

			logEvent(this.analytics, action, parameters);
		}
	}
	/* 🟢 🟢 🟢 🟢 🟢 */
	/**
	 * INSTANCE CREATION AND DETECTION
	 */
	if (typeof window.$ga === 'undefined') {
		window.$ga = new GlobalAnalytics(firebaseConfig);
	}
};

export default createGlobalAnalytics;
