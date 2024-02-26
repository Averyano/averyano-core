import GSAP from 'gsap';
import each from 'lodash/each';
import Page from '@averyano/core/classes/Page';


export default class AboutPage extends Page {
	constructor() {
		super({
			element: '.about',
			elements: {
				title: '.about__title'
			},
		});

		this.id = 'about';
		this.isCreated = false;
	}

	create() {
		console.log('🔼 Create About Page', this.template);
		if (this.template != this.id) return;
		if (!this.isReady) super.createComponent();
		if (!this.isCreated) {
			this.components = {};
			this.isCreated = true;
		}

		super.create();

		// window.$ga.trackEvent('Page View', {
		// 	action: 'Visit',
		// 	label: '/' + this.id,
		// });
		console.log(`🔼 ${this.id} is created`);
	}

	show() {
		console.log('🔼 Show About Page');
		GSAP.to(this.elements.title, {
			autoAlpha: 1,
			duration: 0.5,
		});
		each(this.components, (component) => {
			if (component.show) component.show();
		});
	}

	hide() {
		return new Promise((resolve) => {
			GSAP.to(this.element, {
				autoAlpha: 0,
				duration: 0.5,
				onComplete: resolve,
			});
		});
	}
}
